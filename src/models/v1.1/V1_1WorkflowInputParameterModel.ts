import {InputParameter, RecordField} from "../../mappings/v1.0";
import {V1WorkflowInputParameterModel} from "../v1.0/V1WorkflowInputParameterModel";
import {V1_1SecondaryFileSchemaModel} from "./V1_1SecondaryFileSchemaModel";
import {incrementLastLoc, isType} from "../helpers";
import {LoadListing} from "../elements/load-listing";

export class V1_1WorkflowInputParameterModel extends V1WorkflowInputParameterModel {

    secondaryFiles: V1_1SecondaryFileSchemaModel [];

    loadListing: LoadListing;

    addSecondaryFile(file: any): any {

        const loc = incrementLastLoc(this.secondaryFiles, `${this.loc}.secondaryFiles`);
        const secondaryFile = new V1_1SecondaryFileSchemaModel(file, loc, this.eventHub);
        secondaryFile.setValidationCallback(err => this.updateValidity(err));
        this.secondaryFiles.push(secondaryFile);
        return secondaryFile;

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

    serialize(): InputParameter | RecordField {

        const base = super.serialize();

        const isDirectory = isType(this, ['Directory']);

        if (isDirectory) {
            base["listing"] = `${this.loadListing}`;
        } else {
            delete base["listing"];
        }

        return base;

    }

    deserialize(attr: InputParameter | RecordField): void {
        super.deserialize(attr);

        const isDirectory = isType(this, ['Directory']);

        if (isDirectory) {
            this.loadListing = new LoadListing(attr["listing"]);
        }

    }

}
