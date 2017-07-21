import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {Plottable} from "./Plottable";
import {STEP_INPUT_CONNECTION_PREFIX} from "../helpers/constants";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ParameterTypeModel} from "./ParameterTypeModel";
import {LinkMergeMethod as SBDraft2LinkMergeMethod} from "../../mappings/v1.0/LinkMergeMethod";
import {LinkMergeMethod as V1LinkMergeMethod} from "../../mappings/d2sb/LinkMergeMethod";
import {EventHub} from "../helpers/EventHub";

export class WorkflowOutputParameterModel extends ValidationBase implements Serializable<any>, Plottable {
    public id: string;
    public source: string[];
    public type: ParameterTypeModel;
    public description?: string;
    public fileTypes: string[] = [];

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

    serialize(): any {
        new UnimplementedMethodException("serialize", "WorkflowOutputParameterModel");
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "WorkflowOutputParameterModel");
    }

    validate(): Promise<any> {
        this.cleanValidity();
        const promises = [];

        promises.push(this.type.validate());

        return Promise.all(promises).then(res => this.issues);
    }
}