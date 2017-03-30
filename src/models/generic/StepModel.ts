import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {WorkflowModel} from "./WorkflowModel";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {ExpressionToolModel} from "./ExpressionToolModel";
import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {ScatterMethod} from "../../mappings/v1.0/ScatterMethod";
import {Plottable} from "./Plottable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Process} from "./Process";
import {EventHub} from "../helpers/EventHub";

export class StepModel extends ValidationBase implements Serializable<any>, Plottable {

    public id: string;
    public description?: string;
    public run: WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    public "in": WorkflowStepInputModel[];
    public out: WorkflowStepOutputModel[];
    public isVisible = true;
    public hasUpdate: boolean;
    public runPath: string = "";
    public revisions: any[];

    protected _label?: string;

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
        this.eventHub.emit("step.change", this);
    }

    protected readonly eventHub: EventHub;

    public hasMultipleScatter: boolean;
    public hasScatterMethod: boolean;

    constructor(loc?, eventHub?) {
        super(loc);
        this.eventHub = eventHub;
    }

    public get inAsMap(): {[key: string]: WorkflowStepInputModel} {
        return this.in.reduce((acc, curr) => {
            return {...acc, ... {[curr.id]: curr}};
        }, {});
    }

    public setRunProcess(process: Process) {
        new UnimplementedMethodException("setRunProcess", "StepModel");
    }

    requirements?: ProcessRequirementModel[];
    hints?: any[];
    scatter?: string | string[];
    scatterMethod?: ScatterMethod;

    get connectionId(): string {
        return this.id;
    }

    customProps: any = {};

    protected compareInPorts() {}

    protected compareOutPorts() {}

    public serializeEmbedded(): any {
        new UnimplementedMethodException("serializeEmbedded", "StepModel");
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "StepModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "StepModel");
    }
}