import {StepModel} from "../generic/StepModel";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";
import {Serializable} from "../interfaces/Serializable";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {V1WorkflowStepOutputModel} from "./V1WorkflowStepOutputModel";
import {ensureArray, snakeCase, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {OutputParameter} from "../generic/OutputParameter";
import {InputParameterModel} from "../generic/InputParameterModel";
import {EventHub} from "../helpers/EventHub";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";

export class V1StepModel extends StepModel implements Serializable<WorkflowStep> {
    public "in": V1WorkflowStepInputModel[] = [];
    public out: V1WorkflowStepOutputModel[] = [];
    public hasMultipleScatter               = true;
    public hasScatterMethod                 = true;
    public scatter;

    constructor(step?, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);
        if (step) this.deserialize(step);
    }

    serializeEmbedded(): WorkflowStep {
        return this._serialize(true);
    }

    serialize(): WorkflowStep {
        return this._serialize(false);
    }

    _serialize(embed: boolean): WorkflowStep {
        let base: WorkflowStep = <WorkflowStep> {};
        base.id                = this.id;
        base.in                = this.in.map(i => i.serialize()).filter(i => {
            const keys = Object.keys(i);
            return !(keys.length === 1 && keys[0] === "id");
        });
        base.out               = this.out.map(o => o.serialize());

        if (this.customProps["sbg:rdfId"] && !embed) {
            base.run = this.customProps["sbg:rdfId"];
        } else if (this.run && typeof this.run.serialize === "function") {
            base.run = this.run.serialize();
        } else {
            base.run = this.runPath;
        }

        // to preserve rdfId and rdfSource in the model
        const temp = {...this.customProps};
        delete temp["sbg:rdfId"];
        delete temp["sbg:rdfSource"];

        if (this._label) base.label = this.label;
        if (this.description) base.doc = this.description;
        if (this.scatter.length) base.scatter = this.scatter;
        if (this.scatterMethod) base.scatterMethod = this.scatterMethod;

        return spreadAllProps(base, temp);
    }

    deserialize(step: WorkflowStep): void {
        const serializedKeys = [
            "id",
            "doc",
            "label",
            "run",
            "scatter",
            "scatterMethod",
            "in",
            "out"
        ];

        this.id          = step.id || "";
        this.description = step.doc;
        this._label       = step.label;
        const hasRun     = step.run && (step.run as any).class;

        if (typeof step.run === "string") {
            console.warn(`Expected to get json for step.run at ${this.loc}, reading in and out from step`);
            this.runPath = step.run;
        } else if (hasRun) {
            this.createRun(step.run);
        }

        this.in  = ensureArray(step.in, "id", "source")
            .map((i, index) => new V1WorkflowStepInputModel(i, this, `${this.loc}.in[${index}]`));
        this.out = ensureArray(step.out, "id")
            .map((o, index) => new V1WorkflowStepOutputModel(o, this, `${this.loc}.out[${index}]`));

        if (hasRun) {
            this.compareInPorts();
            this.compareOutPorts();
        }

        this.in.forEach(i => {
            // if in type is a required file or required array of files, include it by default
            if (i.type && !i.type.isNullable && (i.type.type === "File" || i.type.items === "File")) {
                i.isVisible = true;
            }
        });

        //@todo: generalize and parse requirements and hints
        this.requirements = ensureArray(step.requirements, "class");
        this.hints        = ensureArray(step.hints, "class");

        this.scatter       = ensureArray(step.scatter);
        this.scatterMethod = step.scatterMethod;

        spreadSelectProps(step, this.customProps, serializedKeys);
    }

    public setRunProcess(process: { class?: string }): void {
        if (process && process.class) {
            this.createRun(process);

            this.compareInPorts();
            this.compareOutPorts();
        }
    }

    private createRun(process: { class?: string }): void {
        switch (process.class) {
            case "Workflow":
                this.run = WorkflowFactory.from(process as any, `${this.loc}.run`);
                break;
            case "CommandLineTool":
                this.run = CommandLineToolFactory.from(process as any, `${this.loc}.run`);
                break;
            case "ExpressionTool":
                this.run = new ExpressionToolModel(process);
                break;
            default:
                throw new Error(`Unknown process class "${process.class}" at ${this.loc}.step. Expected "CommandLineTool", "Workflow", or "ExpressionTool"`);
        }

        this.id    = this.id || snakeCase(this.run.id) || snakeCase(this.loc);
        this._label = this._label || this.run.label || "";
    }

    protected compareInPorts() {
        const inPorts: Array<V1WorkflowStepInputModel> = this.in;
        const stepInputs: Array<InputParameterModel>   = this.run.inputs;

        // check if step.in includes ports which are not defined in the app
        const inserted = inPorts.filter(port => {
            return stepInputs.findIndex(inp => inp.id === port.id) === -1;
        });

        // if there are steps in ports which aren't in the app, throw a warning for interface mismatch
        if (inserted.length) {
            this.updateValidity({[this.loc]: {
                message: `Step contains input ports which are not present on the app: ${inserted.map(port => port.id).join(",")}. It will not be included in the workflow.`,
                type: "warning"
            }});
        }

        // because type cannot be check on the level of the step (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = stepInputs.map((input, index) => {
            let match: any = inPorts.find(port => input.id === port.id);

            if (match && match.type && match.type.type) {
                if (match.type.type !== input.type.type || match.type.items !== input.type.items) {
                    this.updateValidity({[`${this.loc}.inputs[${index}]`]: {
                        type: "error",
                        message: `Schema mismatch between step input ${this.loc}.inputs[${index}] and step run input ${input.loc}.`
                    }});
                }
            }

            match = match ? match.serialize() : {id: input.id};

            // here will set source and default if they exist
            return new V1WorkflowStepInputModel({
                type: input.type,
                fileTypes: input.fileTypes || [],
                description: input.description,
                label: input.label,
                ...match
            }, this, `${this.loc}.in[${index}]`);
        }).filter(port => port !== undefined);
    }

    protected compareOutPorts() {
        const outPorts: Array<V1WorkflowStepOutputModel> = this.out;
        const stepOutputs: Array<OutputParameter>        = this.run.outputs;

        this.out = stepOutputs.map((output, index) => {
            let match: any = outPorts.find(port => port.id === output.id);
            match          = match ? match.serialize() : {id: output.id};

            return new V1WorkflowStepOutputModel({
                type: output.type,
                fileTypes: output.fileTypes || [],
                description: output.description,
                label: output.label,
                ...match
            }, this, `${this.loc}.out[${index}]`);
        }).filter(port => port !== undefined);
    }
}