import {Workflow} from "../../mappings/v1.0/Workflow";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";
import {InputParameterModel} from "../generic/InputParameterModel";
import {OutputParameter} from "../generic/OutputParameter";
import {ProcessRequirement} from "../generic/ProcessRequirement";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {StepModel} from "../generic/StepModel";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {WorkflowModel} from "../generic/WorkflowModel";
import {EventHub} from "../helpers/EventHub";
import {
    ensureArray,
    isFileType,
    snakeCase,
    spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {Serializable} from "../interfaces/Serializable";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {V1WorkflowStepOutputModel} from "./V1WorkflowStepOutputModel";

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

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        return this.createReq(hint, V1ExpressionModel, undefined, true);
    }

    serializeEmbedded(retainSource: boolean = false): WorkflowStep {
        return this._serialize(true, retainSource);
    }

    serialize(): WorkflowStep {
        return this._serialize(false);
    }

    _serialize(embed: boolean, retainSource: boolean = false): WorkflowStep {
        let base: WorkflowStep = <WorkflowStep> {};
        base.id                = this.id;
        base.in                = this.in.map(i => i.serialize()).filter(i => {
            const keys = Object.keys(i);
            return !(keys.length === 1 && keys[0] === "id");
        });
        base.out               = this.out.map(o => o.serialize());

        if (this.customProps["sbg:rdfId"] && !embed) {
            base.run = this.customProps["sbg:rdfId"];
        } else if (embed && this.run && this.run instanceof WorkflowModel) {
            base.run = this.run.serializeEmbedded();
        } else if (this.run && typeof this.run.serialize === "function") {
            base.run = this.run.serialize();
        } else {
            base.run = this.runPath;
        }

        // to preserve rdfId and rdfSource in the model
        const temp = {...this.customProps};

        if (!retainSource) {
            delete temp["sbg:rdfId"];
            delete temp["sbg:rdfSource"];
        }

        if (this._label) base.label = this.label;
        if (this.description) base.doc = this.description;
        if (this.scatter.length) base.scatter = this.scatter;
        if (this.scatterMethod) base.scatterMethod = this.scatterMethod;

        if (this.hints.length) {
            base.hints = this.hints.map((hint) => hint.serialize())
        }

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
            "out",
            "hints"
        ];

        this.id          = step.id || "";
        this.description = step.doc;
        this._label      = step.label;
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
            // if in type is a required file/directory or required array of files/directories
            // include it by default
            if (i.type &&
                !i.type.isNullable &&
                (i.type.type === "File" ||
                i.type.items === "File" ||
                i.type.type === "Directory" ||
                i.type.items === "Directory")) {
                i.isVisible = true;
            }
        });

        //@todo: generalize and parse requirements and hints
        this.requirements = ensureArray(step.requirements, "class");

        this.hints = ensureArray(step.hints).map((hint, i) => {
            return this.createReq(hint, V1ExpressionModel, `${this.loc}.hints[${i}]`, true);
        });

        this.scatter       = ensureArray(step.scatter);
        this.scatterMethod = step.scatterMethod;

        spreadSelectProps(step, this.customProps, serializedKeys);
    }

    public setRunProcess(process: { class?: string }): void {
        if (process && process.class) {
            this.createRun(process);

            this.compareInPorts(true);
            this.compareOutPorts(true);
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

        // when the step is being updated, the ID will not change
        this.id     = this.id || snakeCase(this.run.id) || snakeCase(this.loc);
        this._label = this._label || this.run.label || "";
    }

    protected compareInPorts(isUpdate = false) {
        const runInputs: InputParameterModel[] = this.run.inputs;

        let inserted = [], removed, remaining;
        remaining    = this.in;

        // only send events for creating, removing and updating ports if the run is being updated
        // when the workflow is initialized the first time, all this will happen automatically
        if (isUpdate) {
            [inserted, remaining, removed] = StepModel.portDifference(this.in, this.run.inputs);

            // emit an event about the in port being removed so the workflow can remove it from the graph
            removed.forEach(r => this.eventHub.emit("step.inPort.remove", r));

            // fyi: inserted and remaining nodes are updated in the graph after the model is created because
            // 1. inserted array is of InputParamModel and doesn't have connectionId (can't be added to graph)
            // 2. remaining array doesn't have now info yet (changed type, fileTypes, etc)
        }

        // because type cannot be check on the level of the step
        // (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = runInputs.map((input, index) => {
            let match: any = remaining.find(port => input.id === port.id);

            // serialize the match to create a new input from it
            const serialized = match ? match.serialize() : {id: input.id};

            // here will set source and default if they exist
            const model = new V1WorkflowStepInputModel({
                type: input.type,
                format: input.fileTypes || [],
                doc: input.description,
                label: input.label,
                ...serialized // serialized match goes last so changed properties are overwritten
            }, this, `${this.loc}.in[${index}]`);

            model.setValidationCallback((err) => this.updateValidity(err));

            // in case the port was inserted, signify to parent workflow that
            // it should be added to the graph
            if (inserted.find(i => i.id === model.id)) {
                this.eventHub.emit("step.inPort.add", model);
            }

            // in case there is a match and the step is being updated, signify to parent workflow
            // to update node info in graph
            if (match && isUpdate) {
                this.eventHub.emit("step.port.change", model);
            }

            // maintain the same visibility of the port
            // if the match was found, set to old visibility. If not, show if it's a required file
            model.isVisible = match ? match.isVisible : isFileType(model, true);

            return model;
        }).filter(port => port !== undefined);
    }

    protected compareOutPorts(isUpdate = false) {
        const runOutputs: Array<OutputParameter> = this.run.outputs;

        let inserted = [], removed, remaining;

        // only send events for creating, removing, and updating ports if the run is being updated
        // when the workflow is initialized the first time, all this will happen automatically
        if (isUpdate) {
            [inserted, remaining, removed] = StepModel.portDifference(this.out, this.run.outputs);

            // emit an event about the in port being removed so the workflow can remove it from the graph
            removed.forEach(r => this.eventHub.emit("step.outPort.remove", r));
        }

        this.out = runOutputs.map((output, index) => {
            let match: any = this.out.find(port => port.id === output.id);
            match          = match ? match.serialize() : {id: output.id};

            const model = new V1WorkflowStepOutputModel({
                type: output.type,
                format: output.fileTypes || [],
                doc: output.description,
                label: output.label,
                ...match
            }, this, `${this.loc}.out[${index}]`);

            if (inserted.find(i => i.id === model.id)) {
                this.eventHub.emit("step.outPort.add", model);
            }

            if (match && isUpdate) {
                this.eventHub.emit("step.port.change", model);
            }

            return model;

        }).filter(port => port !== undefined);
    }
}