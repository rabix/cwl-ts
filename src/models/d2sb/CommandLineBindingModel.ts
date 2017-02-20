import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {Serializable} from "../interfaces/Serializable";
import {ExpressionModel} from "./ExpressionModel";
import {Expression} from "../../mappings/d2sb/Expression";
import {ValidationBase, Validation} from "../helpers/validation";
import {spreadSelectProps} from "../helpers/utils";

export class CommandLineBindingModel extends ValidationBase implements Serializable<CommandLineBinding> {
    public position: number;
    public prefix: string;
    public separate: boolean;
    public itemSeparator: string;
    public valueFrom: ExpressionModel;

    public loadContents: boolean;

    get secondaryFiles(): ExpressionModel[] {
        return this._secondaryFiles;
    }

    set secondaryFiles(files: ExpressionModel[]) {
        this._secondaryFiles = files;

        files.forEach((file, index) => {
            file.loc = `${this.loc}.secondaryFiles[${index}]`;
            file.setValidationCallback((err) => this.updateValidity(err))
        });
    }

    private _secondaryFiles: ExpressionModel[] = [];

    public customProps: any          = {};
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
        this.valueFrom = new ExpressionModel(`${this.loc}.valueFrom`, val);
        this.valueFrom.setValidationCallback((err: Validation) => {
            this.updateValidity(err);
        });
    }

    public updateSecondaryFile(file: ExpressionModel, index: number) {
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

    public addSecondaryFile(file: ExpressionModel) {
        this.updateSecondaryFile(file, this._secondaryFiles.length);
    }


    serialize(): CommandLineBinding {
        const serialized: CommandLineBinding = <CommandLineBinding> {};

        this.serializedKeys.forEach(key => {
            if (this[key] !== undefined && key !== "valueFrom" && key !== "secondaryFiles") {
                serialized[key] = this[key];
            }
        });

        if (this._secondaryFiles.length) {
            serialized.secondaryFiles = <Array<string | Expression>> this._secondaryFiles
                .map(file => file.serialize())
                .filter(file => !!file);
        }

        if (!serialized.loadContents) delete serialized.loadContents;

        if (this.valueFrom.serialize() !== undefined) {
            serialized.valueFrom = <string | Expression> this.valueFrom.serialize();
        }

        return Object.assign(serialized, this.customProps);
    }

    deserialize(binding: CommandLineBinding): void {
        if (binding && binding.constructor === Object) {
            this.position      = binding.position;
            this.prefix        = binding.prefix;
            this.separate      = binding.separate;
            this.itemSeparator = binding.itemSeparator;
            this.loadContents  = binding.loadContents === true;

            this.valueFrom = new ExpressionModel(`${this.loc}.valueFrom`, binding.valueFrom);
            this.valueFrom.setValidationCallback((err: Validation) => this.updateValidity(err));

            if (binding.secondaryFiles) {
                if (Array.isArray(binding.secondaryFiles)) {
                    //noinspection TypeScriptUnresolvedFunction
                    this._secondaryFiles = binding.secondaryFiles
                        .map((file, index) => {
                            const f = new ExpressionModel(`${this.loc}.secondaryFiles[${index}]`,
                                file);
                            f.setValidationCallback((err) => this.updateValidity(err));
                            return f;
                        });
                } else {
                    const f = new ExpressionModel(`${this.loc}.secondaryFiles[0]`,
                        <string | Expression> binding.secondaryFiles);
                    f.setValidationCallback((err) => this.updateValidity(err));

                    this._secondaryFiles = [f];
                }
            }

            // populates object with all custom attributes not covered in model
            spreadSelectProps(binding, this.customProps, this.serializedKeys);
        }
    }
}