import {CommandInputParameter} from "../../mappings/v1.0/CommandInputParameter";
import {CommandInputRecordField} from "../../mappings/v1.0/CommandInputRecordField";
import {ParameterTypeModel} from "../generic/ParameterTypeModel";
import {V1CommandInputParameterModel} from "../v1.0/V1CommandInputParameterModel";
import {V1_1CommandLineBindingModel} from "./V1_1CommandLineBindingModel";

import {incrementLastLoc, isType} from "../helpers/utils";
import {V1_1SecondaryFileSchemaModel} from "./V1_1SecondaryFileSchemaModel";
import {LoadListing} from "../elements/load-listing";


export class V1_1CommandInputParameterModel extends V1CommandInputParameterModel {

    loadContents: boolean;

    secondaryFiles: V1_1SecondaryFileSchemaModel [];

    loadListing: LoadListing;

    public inputBinding: V1_1CommandLineBindingModel;

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

    deserialize(attr: CommandInputParameter | CommandInputRecordField): void {

        super.deserialize(attr);

        if ((this.inputBinding && this.inputBinding.loadContents) || attr["loadContents"]) {
            this.loadContents = true;
        }

        if (attr.inputBinding !== undefined) {
            this.addInputBinding(attr);
        } else {
            this.removeInputBinding();
        }

        this.type.hasStdinType = true;

        this.loadListing = new LoadListing(attr["loadListing"]);

    }

    serialize(): CommandInputParameter | CommandInputRecordField {
        const base = super.serialize();

        if (base.inputBinding) {
            delete base.inputBinding.loadContents;
        }


        if (this.loadContents) {
            base["loadContents"] = this.loadContents;
        }

        if (this.streamable !== undefined) {
            (base as CommandInputParameter).streamable = this.streamable;
        }

        if (this.secondaryFiles && this.secondaryFiles.length) {
            (base as any).secondaryFiles = this.secondaryFiles.map(f => f.serialize()).filter(f => !!f);
        }

        this.type.hasStdinType = true;

        const isDirectory = isType(this, ["Directory"]);

        if (isDirectory) {
            base["loadListing"] = `${this.loadListing}`;
        } else {
            delete base["loadListing"];
        }

        const isStdin = isType(this, ["stdin"]);

        if (isStdin) {
            delete base.inputBinding;
        }

        return base;
    }

    addParameter(attr: CommandInputParameter | CommandInputRecordField): void {

        this.type = new ParameterTypeModel(
            attr.type,
            V1_1CommandInputParameterModel,
            `${this.id}_field`,
            `${this.loc}.type`,
            this.eventHub);


        if (attr.type && attr.type["inputBinding"]) {
            const binding = new V1_1CommandLineBindingModel(attr.type["inputBinding"], `${this.type.loc}.inputBinding`, this.eventHub);
            this.type.addInputBinding(binding);
        }

        this.type.setValidationCallback(err => this.updateValidity(err));
    }

    public createInputBinding(): V1_1CommandLineBindingModel {

        this.inputBinding = new V1_1CommandLineBindingModel({}, `${this.loc}.inputBinding`, this.eventHub);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));

        return this.inputBinding;
    }

    addInputBinding(attr) {

        this.inputBinding = new V1_1CommandLineBindingModel(attr.inputBinding, `${this.loc}.inputBinding`, this.eventHub);
        this.inputBinding.setValidationCallback(err => this.updateValidity(err));

    }

}
