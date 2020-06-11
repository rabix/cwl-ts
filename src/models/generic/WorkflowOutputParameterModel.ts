import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {Plottable} from "./Plottable";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {LinkMergeMethod as SBDraft2LinkMergeMethod} from "../../mappings/v1.0/LinkMergeMethod";
import {LinkMergeMethod as V1LinkMergeMethod} from "../../mappings/d2sb/LinkMergeMethod";
import {EventHub} from "../helpers/EventHub";
import {ErrorCode} from "../helpers/validation/ErrorCode";
import {ExpressionModel} from "./ExpressionModel";
import {Expression as V1Expression} from "../../mappings/v1.0/Expression";
import {incrementLastLoc, isFileType} from "../helpers/utils";
import {Expression as SBDraft2Expression} from "../../mappings/d2sb/Expression";

export abstract class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public source: string[];
    public type: ParameterTypeModel;
    public description?: string;
    public fileTypes: string[] = [];
    public secondaryFiles: ExpressionModel[] | any = [];

    public isField = false;

    protected _label?: string;

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
        this.eventHub.emit("io.change", this);
    }

    public linkMerge: SBDraft2LinkMergeMethod | V1LinkMergeMethod;

    public isVisible = true;

    protected eventHub: EventHub;

    constructor(loc?, eventHub?) {
        super(loc);
        this.eventHub = eventHub;
    }

    get destinationId(): string {
        return this.id;
    }

    get connectionId(): string {
        return `${STEP_INPUT_CONNECTION_PREFIX}${this.id}/${this.id}`;
    }

    updateLoc(loc: string) {
        // must update location of self first
        super.updateLoc(loc);

        // update location of type, so that in case the input is a field,
        // newly created fields will have correct loc
        this.type.updateLoc(`${loc}.type`);
    }

    customProps: any = {};

    abstract addSecondaryFile(file: V1Expression | SBDraft2Expression | string): ExpressionModel;

    protected _addSecondaryFile<T extends ExpressionModel>(file: V1Expression | SBDraft2Expression | string,
                                                           exprConstructor: new(...args: any[]) => T,
                                                           locBase: string): T {
        const loc = incrementLastLoc(this.secondaryFiles, `${locBase}.secondaryFiles`);
        const f = new exprConstructor(file, loc, this.eventHub);
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

    serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowOutputParameterModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowOutputParameterModel");
    }

    validate(): Promise<any> {
        this.clearIssue(ErrorCode.ALL);
        const promises = [];

        promises.push(this.type.validate());

        return Promise.all(promises).then(res => this.issues);
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
