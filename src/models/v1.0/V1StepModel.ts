import {StepModel} from "../generic/StepModel";
import {WorkflowStep} from "../../mappings/v1.0/WorkflowStep";
import {Serializable} from "../interfaces/Serializable";
import {V1WorkflowStepInputModel} from "./V1WorkflowStepInputModel";
import {V1WorkflowStepOutputModel} from "./V1WorkflowStepOutputModel";
import {ensureArray, spreadSelectProps} from "../helpers/utils";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {Workflow} from "../../mappings/v1.0/Workflow";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {InputParameter} from "../generic/InputParameter";
import {OutputParameter} from "../generic/OutputParameter";

export class V1StepModel extends StepModel implements Serializable<WorkflowStep> {
    public "in": V1WorkflowStepInputModel[] = [];
    public out: V1WorkflowStepOutputModel[] = [];
           hasMultipleScatter: true;
           hasScatterMethod: true;

    constructor(step?, loc?: string) {
        super(loc);
        if (step) this.deserialize(step);
    }

    serialize(): WorkflowStep {
        return {
            id: this.id,
            "in": this.in.map(i => i.serialize()),
            out: this.out.map(o => o.serialize()),
            run: this.run.serialize()
        };
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
        this.label       = step.label;

        if (typeof step.run === "string") {
            console.warn(`Expected to get json for step.run at ${this.loc}, reading in and out from step`);

            this.in  = ensureArray(step.in, "id", "source")
                .map((i, index) => new V1WorkflowStepInputModel(i, this, `${this.loc}.in[${index}]`));
            this.out = ensureArray(step.out, "id")
                .map((o, index) => new V1WorkflowStepOutputModel(o, this, `${this.loc}.out[${index}]`));

        } else if (step.run && step.run.class) {
            switch (step.run.class) {
                case "Workflow":
                    this.run = WorkflowFactory.from(step.run);
                    break;
                case "CommandLineTool":
                    this.run = CommandLineToolFactory.from(step.run);
                    break;
            }

            this.id = step.id || step.run.id || this.loc || "";

            this.compareInPorts(step);
            this.compareOutPorts(step);
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

        this.scatter       = step.scatter;
        this.scatterMethod = step.scatterMethod;

        spreadSelectProps(step, this.customProps, serializedKeys);
    }

    private compareInPorts(step: WorkflowStep) {
        const inPorts                           = ensureArray(step.in, "id", "source");
        const stepInputs: Array<InputParameter> = this.run.inputs;

        // check if step.in includes ports which are not defined in the app
        const inserted = inPorts.filter(port => {
            return stepInputs.findIndex(inp => inp.id === port.id) === -1;
        });

        // if there are steps in ports which aren't in the app, throw a warning for interface mismatch
        if (inserted.length) {
            this.validation.warnings.push({
                message: `Step contains input ports which are not present on the app: ${inserted.map(port => port.id)}`,
                loc: this.loc
            });
        }

        // because type cannot be check on the level of the step (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = stepInputs.map((input, index) => {
            const match = inPorts.find(port => input.id === port.id) || {id: input.id};

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

    private compareOutPorts(step: WorkflowStep) {
        const outPorts                            = ensureArray(step.out, "id");
        const stepOutputs: Array<OutputParameter> = this.run.outputs;

        this.out = stepOutputs.map((output, index) => {
            const match = outPorts.find(port => port.id === output.id) || {id: output.id};

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