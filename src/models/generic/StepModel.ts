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
import {ProcessRequirement} from "./ProcessRequirement";
import {RequirementBaseModel} from "./RequirementBaseModel";
import {InputParameterModel} from "./InputParameterModel";

export type Ports = Array<WorkflowStepInputModel | WorkflowStepOutputModel>;

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
    hints: Array<ProcessRequirementModel> = [];
    scatter?: string | string[];
    scatterMethod?: ScatterMethod;

    get connectionId(): string {
        return this.id;
    }

    customProps: any = {};

    protected compareInPorts(isUpdate = false) {}

    protected compareOutPorts(isUpdate = false) {}

    public serializeEmbedded(): any {
        new UnimplementedMethodException("serializeEmbedded", "StepModel");
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        new UnimplementedMethodException("addHint", "WorkflowModel");
        return null;
    }

    protected createReq(req: ProcessRequirement, constructor, loc?: string, hint = false): RequirementBaseModel {
        let reqModel: RequirementBaseModel;
        const property = hint ? "hints" : "requirements";
        loc            = loc || `${this.loc}.${property}[${this[property].length}]`;

        reqModel        = new RequirementBaseModel(req, constructor, loc);
        reqModel.isHint = hint;

        (this[property] as Array<ProcessRequirementModel>).push(reqModel);
        reqModel.setValidationCallback((err) => this.updateValidity(err));

        return reqModel;
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "StepModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "StepModel");
    }

    static portDifference(stepPorts: Ports, runParameters: InputParameterModel[]): [InputParameterModel[], Ports, Ports] {
        const inserted = []; // contains only InputParamModels from run.inputs
        let remaining: Ports  = []; // contains whatever is left from inPorts that's still in run.inputs
        const removed: Ports  = [...stepPorts]; // contains what isn't in run.inputs

        for (let i = 0; i < runParameters.length; i++) {
            const index = removed.findIndex(inp => inp.id === runParameters[i].id);
            if (index === -1) {
                inserted.push(runParameters[i]);
            } else {
                remaining = [...remaining, ...removed.splice(index, 1)];
            }
        }

        return [inserted, remaining, removed];
    }
}