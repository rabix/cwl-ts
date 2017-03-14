import {ValidationBase} from "../helpers/validation/ValidationBase";
import {Serializable} from "../interfaces/Serializable";
import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {ExpressionModel} from "./ExpressionModel";
import {CommandLineBindingModel} from "./CommandLineBindingModel";

export abstract class CommandArgumentModel extends ValidationBase implements Serializable<any> {
    protected binding: CommandLineBindingModel;

    get prefix(): string {
        return this.binding.prefix;
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
    customProps: any = {};

    toString(): string {
        new UnimplementedMethodException("toString", "SBDraft2CommandArgumentModel");
        return null;
    }

    serialize(): any {
        new UnimplementedMethodException("serialize", "SBDraft2CommandArgumentModel");
        return null;
    }

    deserialize(attr: any): void {
        new UnimplementedMethodException("deserialize", "SBDraft2CommandArgumentModel");
    }
}