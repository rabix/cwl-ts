import {FileDef} from "../../mappings/d2sb/FileDef";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {spreadSelectProps} from "../helpers/utils";

export class FileDefModel extends ValidationBase implements Serializable<FileDef>{
    public filename = new SBDraft2ExpressionModel(`${this.loc}.filename`);
    public fileContent = new SBDraft2ExpressionModel(`${this.loc}.fileContent`);

    constructor(fileDef?: FileDef, loc?: string) {
        super(loc);
        
        this.deserialize(fileDef)
    }

    customProps: any = {};

    serialize(): FileDef {
       let base = <FileDef> {};

       if (this.filename.serialize() !== undefined) {
           base.filename = <string | Expression> this.filename.serialize();
       }
       if (this.fileContent.serialize() !== undefined) {
           base.fileContent = <string | Expression> this.fileContent.serialize();
       }

       return Object.assign({}, base, this.customProps);
    }

    deserialize(attr: FileDef): void {
        if (attr) {
            this.filename = new SBDraft2ExpressionModel(`${this.loc}.filename`, attr.filename);
            this.filename.setValidationCallback(err => this.updateValidity(err));

            this.fileContent = new SBDraft2ExpressionModel(`${this.loc}.fileContent`, attr.fileContent);
            this.fileContent.setValidationCallback(err => this.updateValidity(err));
        }

        spreadSelectProps(attr, this.customProps, ["filename", "fileContent"]);
    }
}