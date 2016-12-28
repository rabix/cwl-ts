import {ProcessRequirementModel} from "./ProcessRequirementModel";
import {CreateFileRequirementClass} from "../../mappings/d2sb/CreateFileRequirement";
import {CreateFileRequirement} from "../../mappings/d2sb/CreateFileRequirement";
import {FileDef} from "../../mappings/d2sb/FileDef";
import {Serializable} from "../interfaces/Serializable";
import {FileDefModel} from "./FileDefModel";

export class CreateFileRequirementModel extends ProcessRequirementModel implements Serializable<CreateFileRequirement> {
    public 'class': CreateFileRequirementClass = "CreateFileRequirement";
    private _fileDef: FileDefModel[];

    get fileDef(): FileDefModel[] {
        return this._fileDef;
    }

    set fileDef(value: FileDefModel[]) {
        this._fileDef = [];

        value.forEach((def, index) => {
            if (!(def instanceof FileDefModel)) {
                def = new FileDefModel(<FileDef> def);
            }
            this._fileDef.push(def);

            def.loc = `${this.loc}[${index}]`;
            def.setValidationCallback(err => this.updateValidity(err));
        })
    }

    public customProps: any = {};

    constructor(req: CreateFileRequirement, loc?: string) {
        super(req, loc);
        this.deserialize(req);
    }

    public addFileDef(def: FileDefModel | FileDef) {
        if (def instanceof FileDefModel) {
            this._fileDef.push(def);
            def.setValidationCallback(err => this.updateValidity(err));
            def.loc = `${this.loc}[${this._fileDef.length}]`;
        } else {
            const d = new FileDefModel(<FileDef> def);
            d.loc   = `${this.loc}[${this._fileDef.length}]`;
            d.setValidationCallback(err => this.updateValidity(err));
            this._fileDef.push(d);
        }
    }

    deserialize(req: CreateFileRequirement) {
        this._fileDef = req.fileDef.map((def, index) => {
            const d = new FileDefModel(def, `${this.loc}.fileDef[${index}]`);
            d.setValidationCallback(err => this.updateValidity(err));
            return d;
        });

        Object.keys(req).forEach(key => {
            if (key !== "fileDef" && key !== "class") this.customProps[key] = req[key];
        });
    }

    serialize(): CreateFileRequirement {
        let base = <CreateFileRequirement> {};

        base.class   = "CreateFileRequirement";
        base.fileDef = this._fileDef.map(def => def.serialize());

        return Object.assign({}, base, this.customProps);
    }

}