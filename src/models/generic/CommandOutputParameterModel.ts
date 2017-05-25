import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {CommandOutputBindingModel} from "./CommandOutputBindingModel";
import {ExpressionModel} from "./ExpressionModel";
import {Expression as V1Expression} from "../../mappings/v1.0/Expression";
import {Expression as SBDraft2Expression} from "../../mappings/d2sb/Expression";


export abstract class CommandOutputParameterModel extends ValidationBase implements Serializable<any>{
    /** Unique identifier of output */
    public id: string;
    /** Human readable short name */
    public label: string;
    /** Human readable description */
    public description: string;
    /** Description of file types expected for output to be */
    public fileTypes: string[];

    public secondaryFiles: ExpressionModel[];

    public hasSecondaryFiles: boolean;
    public hasSecondaryFilesInRoot: boolean;

    /** Complex object that holds logic and information about output's type property */
    public type: ParameterTypeModel;

    /** Flag if output is field of a parent record. Derived from type */
    public isField: boolean;

    /** Binding for connecting output files and CWL output description */
    public outputBinding: CommandOutputBindingModel;

    public customProps: any = {};

    public updateOutputBinding(binding?: CommandOutputBindingModel) {
        new UnimplementedMethodException("updateOutputBinding", "CommandOutputParameterModel");
    }

    abstract addSecondaryFile(file: V1Expression | SBDraft2Expression | string): ExpressionModel;

    abstract updateSecondaryFiles(files: Array<V1Expression | SBDraft2Expression | string>);

    abstract removeSecondaryFile(index: number);

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandOutputParameterModel");
        return null;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandOutputParameterModel");
    }
}