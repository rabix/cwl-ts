import {StepModel} from "../generic/StepModel";
import {WorkflowModel} from "../generic/WorkflowModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {SBDraft2WorkflowStepOutputModel} from "./SBDraft2WorkflowStepOutputModel";
import {WorkflowStep} from "../../mappings/d2sb/WorkflowStep";
import {
    ensureArray,
    snakeCase,
    spreadAllProps,
    spreadSelectProps,
    isFileType
} from "../helpers/utils";
import {OutputParameter} from "../generic/OutputParameter";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {InputParameterModel} from "../generic/InputParameterModel";
import {EventHub} from "../helpers/EventHub";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {ProcessRequirement} from "../generic/ProcessRequirement";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";

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

            this.compareInPorts(true);
            this.compareOutPorts(true);
        }
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        return this.createReq(hint, SBDraft2ExpressionModel, undefined, true);
    }

    protected compareInPorts(isUpdate = false) {
        const runInputs: Array<InputParameterModel> = this.run.inputs;

        let inserted = [], removed, remaining;
        remaining    = this.in;

        if (isUpdate) {
            [inserted, remaining, removed] = StepModel.portDifference(this.in, this.run.inputs);

            removed.forEach(r => this.eventHub.emit("step.inPort.remove", r));
        }

        // because type cannot be check on the level of the step
        // (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = runInputs.map((input, index) => {
            let match: any = remaining.find(port => input.id === port.id);

            const serialized = match ? match.serialize() : {id: this.id + "." + input.id};

            // here will set source and default if they exist
            const newPort = new SBDraft2WorkflowStepInputModel({
                type: input.type,
                fileTypes: input.fileTypes || [],
                description: input.description,
                label: input.label,
                ...serialized,
                "sbg:toolDefaultValue": input.customProps["sbg:toolDefaultValue"],
                "sbg:category": input.customProps["sbg:category"],
                "sbg:altPrefix": input.customProps["sbg:altPrefix"]
            }, this, `${this.loc}.inputs[${index}]`);

            newPort.setValidationCallback((err) => this.updateValidity(err));

            // in case the port was inserted, signify to parent workflow that
            // it should be added to the graph
            if (inserted.find(i => i.id === newPort.id)) {
                this.eventHub.emit("step.inPort.add", newPort);
            }

            // in case there is a match and the step is being updated, signify to parent workflow
            // to update node info in graph
            if (match && isUpdate) {
                this.eventHub.emit("step.port.change", newPort);
            }

            // for some absurd reason, visibility is kept inside the run property, on the actual input
            newPort.isVisible = match ? match.isVisible : !!input["customProps"]["sbg:includeInPorts"] || isFileType(input, true);
            return newPort;
        }).filter(port => port !== undefined);
    }

    protected compareOutPorts(isUpdate = false) {
        const runOutputs: Array<OutputParameter> = this.run.outputs;

        let inserted = [], removed, remaining;

        if (isUpdate) {
            [inserted, remaining, removed] = StepModel.portDifference(this.out, this.run.outputs);

            removed.forEach(r => this.eventHub.emit("step.outPort.remove", r));
        }

        this.out = runOutputs.map((output, index) => {
            let match: any = this.out.find(port => output.id === port.id);
            match          = match ? match.serialize() : {id: this.id + "." + output.id};

            const model = new SBDraft2WorkflowStepOutputModel({
                type: output.type,
                fileTypes: output.fileTypes,
                description: output.description,
                label: output.label,
                ...match,
            }, this, `${this.loc}.outputs[${index}]`);

            if (inserted.find(i => i.id === model.id)) {
                this.eventHub.emit("step.outPort.add", model);
            }

            if (match && isUpdate) {
                this.eventHub.emit("step.port.change", model);
            }

            return model;
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

        // when the step is being updated, the ID will not change
        this.id = this.id || snakeCase(this.run.id) || snakeCase(this.run.label) || snakeCase(this.loc);
        this.id = this.id.charAt(0) === "#" ? this.id.substr(1) : this.id;

        this._label = this._label || this.run.label || "";
    }

    serialize(): WorkflowStep {
        return this._serialize(false);
    }

    serializeEmbedded(retainSource: boolean = false): WorkflowStep {
        return this._serialize(true, retainSource);
    }

    _serialize(embed: boolean, retainSource: boolean = false): WorkflowStep {
        let base: WorkflowStep = <WorkflowStep> {};

        base.id      = "#" + this.id;
        base.inputs  = this.in.map(i => i.serialize()).filter(i => {
            const keys = Object.keys(i);
            return !(keys.length === 1 && keys[0] === "id");
        });
        base.outputs = this.out.map(o => o.serialize());

        if (this.customProps["sbg:rdfId"] && !embed) {
            base.run = this.customProps["sbg:rdfId"];
        } else if (embed && this.run && this.run instanceof WorkflowModel) {
            base.run = this.run.serializeEmbedded();
        } else if (this.run && typeof this.run.serialize === "function") {
            base.run = this.run.serialize();
        } else {
            base.run = this.runPath;
        }

        if (this.hints.length) {
            base.hints = this.hints.map((hint) => hint.serialize())
        }

        const temp = {...this.customProps};

        if (!retainSource) {
            delete temp["sbg:rdfId"];
            delete temp["sbg:rdfSource"];
        }

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
            "outputs",
            "hints"
        ];

        this.id          = step.id || "";
        this.description = step.description;
        this._label      = step.label;
        this.scatter     = step.scatter ? step.scatter.split(".")[1] : null;

        this.hints = ensureArray(step.hints).map((hint, i) => {
            return this.createReq(hint, SBDraft2ExpressionModel, `${this.loc}.hints[${i}]`, true);
        });

        if (step.run && typeof step.run === "string") {
            this.runPath = step.run;
        } else if (step.run && typeof step.run !== "string" && step.run.class) {
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
            if (isFileType(i, true)) {
                i.isVisible = true;
            }
        });

        spreadSelectProps(step, this.customProps, serializedKeys);
    }
}