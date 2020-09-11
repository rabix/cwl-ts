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
import {incrementLastLoc, validateID, isFileType} from "../helpers/utils";
import {Expression as V1Expression} from "../../mappings/v1.0/Expression";
import {Expression as SBDraft2Expression} from "../../mappings/d2sb/Expression";
import {ErrorCode} from "../helpers/validation/ErrorCode";

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
    public hasSecondaryFilesInRoot: boolean;
    public secondaryFiles: ExpressionModel[] | any;

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

    abstract updateInputBinding(binding: CommandLineBindingModel | SBDraft2CommandLineBinding | V1CommandLineBinding);

    abstract createInputBinding(): CommandLineBindingModel;

    public removeInputBinding() {
        if (this.inputBinding) {
            this.inputBinding.clearIssue(ErrorCode.EXPR_ALL);
        }

        if (!this.hasSecondaryFilesInRoot) {
            this.secondaryFiles.forEach(f => f.clearIssue(ErrorCode.EXPR_ALL));
            this.secondaryFiles = [];
        }

        this.inputBinding = null;

        if (this.type) {
            this.type.typeBinding = null;
        }
    }

    updateLoc(loc: string) {
        // must update location of self first
        super.updateLoc(loc);

        // update location of type, so that in case the input is a field,
        // newly created fields will have correct loc
        this.type.updateLoc(`${loc}.type`);
    }

    abstract addSecondaryFile(file: V1Expression | SBDraft2Expression | string): ExpressionModel;

    protected _addSecondaryFile<T extends ExpressionModel>(file: V1Expression | SBDraft2Expression | string,
                                                           exprConstructor: new(...args: any[]) => T,
                                                           locBase: string): T {
        const loc = incrementLastLoc(this.secondaryFiles, `${locBase}.secondaryFiles`);
        const f   = new exprConstructor(file, loc, this.eventHub);
        this.secondaryFiles.push(f);
        f.setValidationCallback(err => this.updateValidity(err));
        return f;
    }

    abstract updateSecondaryFiles(files: Array<V1Expression | SBDraft2Expression | string>);

    protected _updateSecondaryFiles(files: Array<V1Expression | SBDraft2Expression | string>) {
        this.secondaryFiles.forEach(f => f.clearIssue(ErrorCode.EXPR_ALL));
        this.secondaryFiles = [];
        files.forEach(f => this.addSecondaryFile(f));
    }

    abstract removeSecondaryFile(index: number);

    protected _removeSecondaryFile(index: number) {
        const file = this.secondaryFiles[index];
        if (file) {
            file.setValue("", "string");
            this.secondaryFiles.splice(index, 1);
        }
    }

    public validate(context: any): Promise<any> {
        const promises: Promise<any>[] = [];

        // id
        try {
            validateID(this.id);
        } catch (ex) {
            this.setIssue({
                [this.loc + ".id"]: {
                    type: "error",
                    message: ex.message,
                    code: ex.code
                }
            });
        }

        // inputBinding
        if (this.inputBinding) {
            promises.push(this.inputBinding.validate(context));
        }

        // type
        if (this.type) {
            promises.push(this.type.validate(context));
        }

        // secondaryFiles
        if (this.secondaryFiles) {
            promises.concat(this.secondaryFiles.map(file => file.validate(context)));
        }

        return Promise.all(promises);
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandInputParameterModel");
        return undefined;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandInputParameterModel");
    }


    protected attachFileTypeListeners() {
        if (this.eventHub) {
            this.modelListeners.push(this.eventHub.on("io.change.type", (loc: string) => {
                if (`${this.loc}.type` === loc) {
                    if (!isFileType(this)) {
                        this.updateSecondaryFiles([]);
                    }
                }
            }));
        }
    }

}
