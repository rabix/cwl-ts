import {CommandOutputParameter, CommandOutputRecordField} from "../../mappings/v1.0";
import {V1CommandOutputParameterModel} from "../v1.0/V1CommandOutputParameterModel";
import {ParameterTypeModel} from "../generic";
import {incrementLastLoc, isType} from "../helpers/utils";

import {V1_1OutputSecondaryFileSchemaModel} from "./V1_1SecondaryFileSchemaModel";
import {LoadListing} from "../elements/load-listing";


export class V1_1CommandOutputParameterModel extends V1CommandOutputParameterModel {

    loadListing: LoadListing;

    secondaryFiles: V1_1OutputSecondaryFileSchemaModel[];

    addSecondaryFile(file: any): any {

        const loc = incrementLastLoc(this.secondaryFiles, `${this.loc}.secondaryFiles`);
        const secondaryFile = new V1_1OutputSecondaryFileSchemaModel(file, loc, this.eventHub);
        secondaryFile.setValidationCallback(err => this.updateValidity(err));
        this.secondaryFiles.push(secondaryFile);
        return secondaryFile;

    }

    addParameter(attr: CommandOutputParameter | CommandOutputRecordField) {

        this.type = new ParameterTypeModel(
            attr.type,
            V1_1CommandOutputParameterModel,
            `${this.id}_field`,
            `${this.loc}.type`,
            this.eventHub);

        this.type.setValidationCallback(err => this.updateValidity(err));

    }

    updateSecondaryFiles(files: Array<any | string>) {
        this._updateSecondaryFiles(files);
    }

    removeSecondaryFile(index: number) {
        const file = this.secondaryFiles[index];
        if (file) {
            this.secondaryFiles.splice(index, 1);
        }
    }

    serialize(): CommandOutputParameter {
        const base = super.serialize();

        if (this.streamable) {
            (<CommandOutputParameter>base).streamable = this.streamable;
        }

        if (this.secondaryFiles.length && (this.type.type === "File" || this.type.items === "File")) {
            (base as any).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        if (isType(this, ['Directory'])) {
            base.outputBinding = base.outputBinding || {};
            base.outputBinding["loadListing"] = `${this.loadListing}`;
        } else if (base.outputBinding) {
            delete base.outputBinding["loadListing"];
        }

        return base;
    }

    deserialize(attr: CommandOutputParameter | CommandOutputRecordField): void {
        super.deserialize(attr);

        this.loadListing = new LoadListing((attr.outputBinding && attr.outputBinding["loadListing"]) || "deep_listing");

    }

}
