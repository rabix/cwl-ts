import {V1WorkflowOutputParameterModel} from "../v1.0/V1WorkflowOutputParameterModel";
import {V1_1SecondaryFileSchemaModel} from "./V1_1SecondaryFileSchemaModel";
import {incrementLastLoc} from "../helpers";

export class V1_1WorkflowOutputParameterModel extends V1WorkflowOutputParameterModel {

    secondaryFiles: V1_1SecondaryFileSchemaModel [];

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

}

