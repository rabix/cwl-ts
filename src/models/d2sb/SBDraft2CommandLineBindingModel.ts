import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {Serializable} from "../interfaces/Serializable";
import {SBDraft2ExpressionModel} from "./SBDraft2ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {Validation} from "../helpers/validation";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {CommandLineBindingModel} from "../generic/CommandLineBindingModel";

export class SBDraft2CommandLineBindingModel extends CommandLineBindingModel implements Serializable<CommandLineBinding> {
    public valueFrom: SBDraft2ExpressionModel;
    public hasSecondaryFiles = true;

    get secondaryFiles(): SBDraft2ExpressionModel[] {
        return this._secondaryFiles;
    }

    set secondaryFiles(files: SBDraft2ExpressionModel[]) {
        this._secondaryFiles = files;

        files.forEach((file, index) => {
            file.loc = `${this.loc}.secondaryFiles[${index}]`;
            file.setValidationCallback((err) => this.updateValidity(err))
        });
    }

    private _secondaryFiles: SBDraft2ExpressionModel[] = [];

    private serializedKeys: string[] = [
        "position",
        "prefix",
        "separate",
        "itemSeparator",
        "valueFrom",
        "loadContents",
        "secondaryFiles"
    ];

    constructor(binding?: CommandLineBinding, loc?: string) {
        super(loc);
        this.deserialize(binding || {});
    }

    setValueFrom(val: string | Expression) {
        this.valueFrom = new SBDraft2ExpressionModel(val, `${this.loc}.valueFrom`);
        this.valueFrom.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });
    }

    public updateSecondaryFile(file: SBDraft2ExpressionModel, index: number) {
        this._secondaryFiles[index] = file;

        file.loc = `${this.loc}.secondaryFiles[${index}]`;
        file.setValidationCallback((err) => this.updateValidity(err));
    }

    public removeSecondaryFile(index: number) {
        this._secondaryFiles.splice(index, 1);

        if (index !== this._secondaryFiles.length) {
            this._secondaryFiles.forEach((file, index) => {
                file.loc = `${this.loc}.secondaryFiles[${index}]`;
            });
        }
    }

    public addSecondaryFile(file: SBDraft2ExpressionModel) {
        this.updateSecondaryFile(file, this._secondaryFiles.length);
    }


    serialize(): CommandLineBinding {
        const base: CommandLineBinding = <CommandLineBinding> {};

        this.serializedKeys.forEach(key => {
            if (this[key] !== undefined && key !== "valueFrom" && key !== "secondaryFiles") {
                base[key] = this[key];
            }
        });

        if (this._secondaryFiles.length) {
            base.secondaryFiles = <Array<string | Expression>> this._secondaryFiles
                .map(file => file.serialize())
                .filter(file => !!file);
        }

        if (!base.loadContents) delete base.loadContents;

        if (this.valueFrom.serialize() !== undefined) {
            base.valueFrom = <string | Expression> this.valueFrom.serialize();
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(binding: CommandLineBinding): void {
        if (binding && binding.constructor === Object) {
            this.position      = binding.position;
            this.prefix        = binding.prefix;
            this.separate      = binding.separate;
            this.itemSeparator = binding.itemSeparator;
            this.loadContents  = binding.loadContents === true;

            this.valueFrom = new SBDraft2ExpressionModel(binding.valueFrom, `${this.loc}.valueFrom`);
            this.valueFrom.setValidationCallback(err => this.updateValidity(err));

            if (binding.secondaryFiles) {
                if (Array.isArray(binding.secondaryFiles)) {
                    //noinspection TypeScriptUnresolvedFunction
                    this._secondaryFiles = binding.secondaryFiles
                        .map((file, index) => {
                            const f = new SBDraft2ExpressionModel(file, `${this.loc}.secondaryFiles[${index}]`);
                            f.setValidationCallback((err) => this.updateValidity(err));
                            return f;
                        });
                } else {
                    const f = new SBDraft2ExpressionModel(
                        <string | Expression> binding.secondaryFiles,
                        `${this.loc}.secondaryFiles[0]`);
                    f.setValidationCallback((err) => this.updateValidity(err));

                    this._secondaryFiles = [f];
                }
            }

            // populates object with all custom attributes not covered in model
            spreadSelectProps(binding, this.customProps, this.serializedKeys);
        }
    }
}