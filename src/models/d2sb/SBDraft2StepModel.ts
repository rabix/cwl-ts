import {StepModel} from "../generic/StepModel";
import {WorkflowModel} from "../generic/WorkflowModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ExpressionToolModel} from "../generic/ExpressionToolModel";
import {SBDraft2WorkflowStepInputModel} from "./SBDraft2WorkflowStepInputModel";
import {SBDraft2WorkflowStepOutputModel} from "./SBDraft2WorkflowStepOutputModel";
import {WorkflowStep} from "../../mappings/d2sb/WorkflowStep";
import {ensureArray, snakeCase, spreadSelectProps} from "../helpers/utils";
import {InputParameter} from "../generic/InputParameter";
import {OutputParameter} from "../generic/OutputParameter";
import {WorkflowFactory} from "../generic/WorkflowFactory";
import {CommandLineToolFactory} from "../generic/CommandLineToolFactory";
import {Workflow} from "../../mappings/d2sb/Workflow";
import {CommandLineTool} from "../../mappings/d2sb/CommandLineTool";

export class SBDraft2StepModel extends StepModel {
    description?: string;
    label: string;
    run: WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    "in": SBDraft2WorkflowStepInputModel[];
    out: SBDraft2WorkflowStepOutputModel[];
    hasMultipleScatter: false;
    hasScatterMethod: false;

    constructor(step?: WorkflowStep, loc?: string) {
        super(loc);

        if (step) this.deserialize(step);
    }

    private compareInPorts(step: WorkflowStep) {
        const inPorts                           = ensureArray(step.inputs);
        const stepInputs: Array<InputParameter> = this.run.inputs;

        // check if step.in includes ports which are not defined in the app
        const inserted = inPorts.filter(port => {
            return stepInputs.findIndex(inp => step.id + "." + inp.id === port.id) === -1;
        });

        // if there are steps in ports which aren't in the app, throw a warning for interface mismatch
        if (inserted.length) {
            this.validation = {
                errors: [],
                warnings: [{
                    message: `Step contains input ports which are not present on the app: ${inserted.map(port => port.id).join("\n")}`,
                    loc: this.loc
                }]
            };
        }

        // because type cannot be check on the level of the step (step.in is just the id of the incoming port),
        // type and fileTypes from the app's inputs are spliced into the in ports.
        // Type validation is done for connections based on this information
        this.in = stepInputs.map((input, index) => {
            const match = inPorts.find(port => step.id + "." + input.id === port.id) || {id: step.id + "." + input.id};

            // here will set source and default if they exist
            const newPort = new SBDraft2WorkflowStepInputModel({
                type: input.type,
                fileTypes: input.fileTypes || [],
                description: input.description,
                label: input.label,
                ...match,
            }, this, `${this.loc}.in[${index}]`);

            // for some absurd reason, visibility is kept inside the run property, on the actual input
            newPort.isVisible = !!input["customProps"]["sbg:includeInPorts"];

            return newPort;
        }).filter(port => port !== undefined);
    }

    private compareOutPorts(step: WorkflowStep) {
        const outPorts                            = ensureArray(step.outputs);
        const stepOutputs: Array<OutputParameter> = this.run.outputs;

        this.out = stepOutputs.map((output, index) => {
            const match = outPorts.find(port => step.id + "." + output.id === port.id) || {id: step.id + "." + output.id};

            if (match) {
                return new SBDraft2WorkflowStepOutputModel({
                    type: output.type,
                    fileTypes: output.fileTypes,
                    description: output.description,
                    label: output.label,
                    ...match,
                }, this, `${this.loc}.out[${index}]`);
            }
        }).filter(port => port !== undefined);
    }

    serialize(): WorkflowStep {
        return super.serialize();
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

        let id = step.id || "";
        this.description = step.description;
        this.label = step.label;
        this.scatter = step.scatter;

        if (typeof step.run === "string") {
            console.warn(`Expected to get json for step.run at ${this.loc}, reading in and out from step`);

            this.in = ensureArray(step.inputs).map((step, index) => {
                return new SBDraft2WorkflowStepInputModel(step, this, `${this.loc}.inputs[${index}]`)
            });

            this.out = ensureArray(step.outputs).map((step, index) => {
                return new SBDraft2WorkflowStepOutputModel(step, this, `${this.loc}.outputs[${index}]`)
            });
        } else if (step.run && step.run.class) {
            switch (step.run.class) {
                case "Workflow":
                    this.run = WorkflowFactory.from(<Workflow> step.run);
                    break;
                case "CommandLineTool":
                    this.run = CommandLineToolFactory.from(<CommandLineTool> step.run);
                    break;
            }

            id = step.id || snakeCase(this.run.id) || snakeCase(this.run.label) || snakeCase(this.loc);

            this.compareInPorts(step);
            this.compareOutPorts(step);
        }

        this.id = id.charAt(0) === "#" ? id.substr(1) : id;

        this.in.forEach(i => {
            // if in type is a required file or required array of files, include it by default
            if (i.type && !i.type.isNullable && (i.type.type === "File" || i.type.items === "File")) {
                i.isVisible = true;
            }
        });

        spreadSelectProps(step, this.customProps, serializedKeys);
    }
}