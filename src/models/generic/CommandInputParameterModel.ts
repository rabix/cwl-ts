import {InputParameter} from "./InputParameter";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {CommandLineBinding as SBDraft2CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandLineBinding as V1CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {ExpressionModel} from "./ExpressionModel";
import {EventHub} from "../helpers/EventHub";

export abstract class CommandInputParameterModel extends ValidationBase implements InputParameter, Serializable<any> {
    /** unique identifier of input */
    public id: string;
    public type: ParameterTypeModel;
    public fileTypes?: string[];

    /** Flag if input is field of a parent record. Derived from type field */
    public isField: boolean = false;
    public inputBinding?: CommandLineBindingModel;

    public hasStageInput: boolean;
    public hasSecondaryFiles: boolean;
    public secondaryFiles: ExpressionModel[];

    /** Human readable short name */
    public label?: string;
    /** Human readable description */
    public description?: string;

    public customProps: any = {};

    protected eventHub: EventHub;

    constructor(loc?: string, event?: EventHub) {
        super(loc);
        this.eventHub = event;
    }

    public get isBound(): boolean {
        return this.inputBinding !== undefined && this.inputBinding !== null;
    }

    public updateInputBinding(binding: CommandLineBindingModel | SBDraft2CommandLineBinding | V1CommandLineBinding) {
        new UnimplementedMethodException("updateInputBinding", "CommandInputParameterModel");
    }

    public createInputBinding(): CommandLineBindingModel {
        new UnimplementedMethodException("createInputBinding", "CommandInputParameterModel");
        return undefined;
    }

    public removeInputBinding() {
        this.inputBinding = null;
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandInputParameterModel");
        return undefined;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandInputParameterModel");
    }

}