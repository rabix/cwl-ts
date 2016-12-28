import {FileDef} from "../../mappings/d2sb/FileDef";
import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";

export class FileDefModel extends ValidationBase implements Serializable<FileDef>{
    public filename = new ExpressionModel(`${this.loc}.filename`);
    public fileContent = new ExpressionModel(`${this.loc}.fileContent`);

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
            this.filename = new ExpressionModel(`${this.loc}.filename`, attr.filename);
            this.filename.setValidationCallback(err => this.updateValidity(err));

            this.fileContent = new ExpressionModel(`${this.loc}.fileContent`, attr.fileContent);
            this.fileContent.setValidationCallback(err => this.updateValidity(err));
        }

        Object.keys(attr).forEach(key => {
            if (key !== "filename" && key !== "fileContent"){
                this.customProps[key] = attr[key];
            }
        })
    }
}