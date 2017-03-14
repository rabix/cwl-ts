import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {WorkflowModel} from "./WorkflowModel";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {ExpressionToolModel} from "./ExpressionToolModel";
import {ProcessRequirementModel} from "../d2sb/ProcessRequirementModel";
import {ScatterMethod} from "../../mappings/v1.0/ScatterMethod";
import {Plottable} from "./Plottable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Process} from "./Process";

export class StepModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public description?: string;
    public label?: string;
    public run: WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    public "in": WorkflowStepInputModel[];
    public out: WorkflowStepOutputModel[];
    public isVisible = true;
    public hasUpdate: boolean;
    public runPath: string = "";
    public revisions: any[];

    public hasMultipleScatter: boolean;
    public hasScatterMethod: boolean;

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

    serialize(): any {
        new UnimplementedMethodException("serialize");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize");
    }
}