import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {WorkflowStepInputModel} from "./WorkflowStepInputModel";
import {WorkflowStepOutputModel} from "./WorkflowStepOutputModel";
import {WorkflowModel} from "./WorkflowModel";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {ExpressionToolModel} from "./ExpressionToolModel";
import {ProcessRequirementModel} from "../d2sb/ProcessRequirementModel";
import {ScatterMethod} from "../../mappings/v1.0/ScatterMethod";

export class StepModel extends ValidationBase implements Serializable<any> {
    id: string;
    doc: string;
    label: string;
    run: string | WorkflowModel | CommandLineToolModel | ExpressionToolModel;
    in: WorkflowStepInputModel[];
    out: WorkflowStepOutputModel[];

    requirements?: ProcessRequirementModel[];
    hints?: any[];
    scatter?: string | string[];
    scatterMethod?: ScatterMethod;

    customProps: any = {};

    serialize(): any {
        return undefined;
    }

    deserialize(attr: any): void {
    }
}