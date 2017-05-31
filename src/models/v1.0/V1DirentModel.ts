import {DirentModel} from "../generic/DirentModel";
import {Dirent} from "../../mappings/v1.0/Dirent";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {Expression} from "../../mappings/v1.0/Expression";
import {EventHub} from "../helpers/EventHub";

export class V1DirentModel extends DirentModel {


    constructor(dirent?: Dirent, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (dirent) this.deserialize(dirent);
    }

    serialize(): any {
        const base = <Dirent> {};

        if (this.entryName.serialize() !== undefined) {
            base.entryname = <string | Expression> this.entryName.serialize();
        }
        if (this.entry.serialize() !== undefined) {
            base.entry = <string | Expression> this.entry.serialize();
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: any): void {
        this.entryName = new V1ExpressionModel(attr.entryname, `${this.loc}.entryname`, this.eventHub);
        this.entryName.setValidationCallback(err => this.updateValidity(err));

        this.entry = new V1ExpressionModel(attr.entry, `${this.loc}.entry`, this.eventHub);
        this.entry.setValidationCallback(err => this.updateValidity(err));

        spreadSelectProps(attr, this.customProps, ["entry", "entryname"]);
    }
}
