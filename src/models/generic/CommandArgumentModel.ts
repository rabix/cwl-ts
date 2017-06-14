import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ExpressionModel} from "./ExpressionModel";
import {CommandLineBindingModel} from "./CommandLineBindingModel";
import {CommandLineBinding as SBDraft2CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandLineBinding as V1CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {EventHub} from "../helpers/EventHub";

export abstract class CommandArgumentModel extends ValidationBase implements Serializable<any> {
    protected binding: CommandLineBindingModel;
    hasBinding: boolean = false;
    hasExprPrimitive: boolean;
    hasShellQuote: boolean;
    primitive: string | ExpressionModel;

    get prefix(): string {
        return this.binding ? this.binding.prefix : undefined;
    }

    get position(): number {
        return this.binding ? this.binding.position || 0 : 0;
    }

    get separate(): boolean {
        return this.binding ? this.binding.separate !== false : true;
    }

    get itemSeparator(): string {
        return this.binding ? this.binding.itemSeparator : undefined;
    }

    get valueFrom(): ExpressionModel {
        return this.binding ? this.binding.valueFrom : undefined;
    }

    // if binding doesn't have shellQuote, it will return undefined anyway
    get shellQuote(): boolean {
        return this.binding ? (<any> this.binding).shellQuote : undefined;
    }

    customProps: any = {};

    constructor(loc?: string, protected eventHub?: EventHub) {
        super(loc);
    }

    toggleBinding(state: boolean): void {
        new UnimplementedMethodException("toggleBinding", "CommandArgumentModel");
    }

    updatePrimitive(str: string) {
        new UnimplementedMethodException("updatePrimitive", "CommandArgumentModel");
    }

    updateBinding(binding: V1CommandLineBinding | SBDraft2CommandLineBinding) {
        new UnimplementedMethodException("updateBinding", "CommandArgumentModel");
    }

    toString(): string {
        new UnimplementedMethodException("toString", "CommandArgumentModel");
        return null;
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "CommandArgumentModel");
        return null;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "CommandArgumentModel");
    }

    validate(context): Promise<any> {
        console.log("Validate");
        this.cleanValidity();

        if (this.hasBinding) {
            return this.binding.validate(context);
        }

        return new Promise(res => {res(this.issues)});
    }
}