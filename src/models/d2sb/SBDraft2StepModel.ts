import {StepModel} from "../generic/StepModel";
import {WorkflowModel} from "../generic/WorkflowModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {SBDraft2WorkflowStepOutputModel} from "./SBDraft2WorkflowStepOutputModel";
import {WorkflowStep} from "../../mappings/d2sb/WorkflowStep";
import {ensureArray, snakeCase, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {OutputParameter} from "../generic/OutputParameter";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {InputParameterModel} from "../generic/InputParameterModel";
import {EventHub} from "../helpers/EventHub";

export class SBDraft2StepModel extends StepModel {
    run: WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    "in": SBDraft2WorkflowStepInputModel[];
    out: SBDraft2WorkflowStepOutputModel[];
    hasMultipleScatter = false;
    hasScatterMethod   = false;

    constructor(step?: WorkflowStep, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (step) this.deserialize(step);
    }

    public setRunProcess(process: { class?: string }): any {
        if (process && process.class) {
            this.createRun(process);

            this.compareInPorts();
            this.compareOutPorts();
        }
    }

    protected compareInPorts() {
        const inPorts: Array<SBDraft2WorkflowStepInputModel> = this.in;
        const stepInputs: Array<InputParameterModel>         = this.run.inputs;
        const errors                                         = [];
        const warnings                                       = [];

        // check if step.in includes ports which are not defined in the app
        const inserted = inPorts.filter(port => {
            return stepInputs.findIndex(inp => inp.id === port.id) === -1;
        });

        // if there are steps in ports which aren't in the app, throw a warning for interface mismatch
        if (inserted.length) {
            errors.push({
                message: `Step contains input ports which are not present on the app: ${inserted.map(port => port.id).join(",")}. They will not be included in the workflow.`,
                loc: this.loc
            });
        }

        // because type cannot be check on the level of the step (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = stepInputs.map((input, index) => {
            let match: any = inPorts.find(port => input.id === port.id);

            if (match && match.type && match.type.type) {
                if (match.type.type !== input.type.type || (match.type.items && match.type.items !== input.type.items)) {
                    errors.push({
                        message: `Schema mismatch between step input ${this.loc}.inputs[${index}] and step run input ${input.loc}. `
                    });
                }
            }

            match          = match ? match.serialize() : {id: this.id + "." + input.id};

            // here will set source and default if they exist
            const newPort = new SBDraft2WorkflowStepInputModel({
                type: input.type,
                fileTypes: input.fileTypes || [],
                description: input.description,
                label: input.label,
                ...match,
            }, this, `${this.loc}.inputs[${index}]`);

            // for some absurd reason, visibility is kept inside the run property, on the actual input
            newPort.isVisible = !!input["customProps"]["sbg:includeInPorts"];
            return newPort;
        }).filter(port => port !== undefined);

        this.validation = {errors, warnings};
    }

    protected compareOutPorts() {
        const outPorts: Array<SBDraft2WorkflowStepOutputModel> = this.out;
        const stepOutputs: Array<OutputParameter>              = this.run.outputs;

        this.out = stepOutputs.map((output, index) => {
            let match: any = outPorts.find(port => output.id === port.id);
            match          = match ? match.serialize() : {id: this.id + "." + output.id};

            if (match) {
                return new SBDraft2WorkflowStepOutputModel({
                    type: output.type,
                    fileTypes: output.fileTypes,
                    description: output.description,
                    label: output.label,
                    ...match,
                }, this, `${this.loc}.outputs[${index}]`);
            }
        }).filter(port => port !== undefined);
    }

    private createRun(process: { class?: string }) {
        switch (process.class) {
            case "Workflow":
                this.run = WorkflowFactory.from(<Workflow> process, `${this.loc}.run`);
                break;
            case "CommandLineTool":
                this.run = CommandLineToolFactory.from(<CommandLineTool> process, `${this.loc}.run`);
                break;
            case "ExpressionTool":
                this.run = new ExpressionToolModel(process);
                break;
            default:
                throw new Error(`Unknown process class "${process.class}" at ${this.loc}.step. Expected "CommandLineTool", "Workflow", or "ExpressionTool"`);
        }

        this.id = this.id || snakeCase(this.run.id) || snakeCase(this.run.label) || snakeCase(this.loc);
        this.id = this.id.charAt(0) === "#" ? this.id.substr(1) : this.id;

        this._label = this._label || this.run.label || "";
    }

    serialize(): WorkflowStep {
        return this._serialize(false);
    }

    serializeEmbedded(): WorkflowStep {
        return this._serialize(true);
    }

    _serialize(embed: boolean): WorkflowStep {
        let base: WorkflowStep = <WorkflowStep> {};

        base.id = "#" + this.id;
        base.inputs = this.in.map(i => i.serialize()).filter(i => {
            const keys = Object.keys(i);
            return !(keys.length === 1 && keys[0] === "id");
        });
        base.outputs = this.out.map(o => o.serialize());

        if (this.customProps["sbg:rdfId"] && !embed) {
            base.run = this.customProps["sbg:rdfId"];
        } else if (this.run && typeof this.run.serialize === "function") {
            base.run = this.run.serialize();
        } else {
            base.run = this.runPath;
        }

        const temp =  {... this.customProps};
        delete temp["sbg:rdfId"];
        delete temp["sbg:rdfSource"];

        if (this._label) base.label = this._label;
        if (this.description) base.description = this.description;

        if (this.scatter) base.scatter = this.in.filter(i => this.scatter === i.id)[0].destinationId;

        return spreadAllProps(base, temp);
    }

    deserialize(step: WorkflowStep): void {
        const serializedKeys = [
            "id",
            "description",
            "label",
            "run",
            "scatter",
            "inputs",
            "outputs"
        ];

        this.id          = step.id || "";
        this.description = step.description;
        this._label       = step.label;
        this.scatter     = step.scatter ? step.scatter.split(".")[1] : null;

        if (step.run && typeof step.run === "string") {
            this.runPath = step.run;
        } else if (step.run &&  typeof step.run !== "string" && step.run.class) {
            this.createRun(step.run);
        }

        this.id = this.id.charAt(0) === "#" ? this.id.substr(1) : this.id;

        this.in = ensureArray(step.inputs).map((step, index) => {
            return new SBDraft2WorkflowStepInputModel(step, this, `${this.loc}.inputs[${index}]`)
        });

        this.out = ensureArray(step.outputs).map((step, index) => {
            return new SBDraft2WorkflowStepOutputModel(step, this, `${this.loc}.outputs[${index}]`)
        });

        if (typeof step.run === "string") {
            console.warn(`Expected to get json for step.run at ${this.loc}, reading in and out from step`);
        } else {
            this.compareInPorts();
            this.compareOutPorts();
        }

        this.in.forEach(i => {
            // if in type is a required file or required array of files, include it by default
            if (i.type && !i.type.isNullable && (i.type.type === "File" || i.type.items === "File")) {
                i.isVisible = true;
            }
        });

        spreadSelectProps(step, this.customProps, serializedKeys);
    }
}