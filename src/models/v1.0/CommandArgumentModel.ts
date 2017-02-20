import {CommandLineInjectable} from "../interfaces";
import {CommandLineBinding, Expression} from "../../mappings/v1.0";
import {CommandLinePart, ExpressionEvaluator} from "../helpers";

export class CommandArgumentModel implements CommandLineBinding, CommandLineInjectable {
    private value: string;
    position: number;
    prefix: string;
    separate: boolean;
    itemSeparator: string;
    valueFrom: string|Expression;
    shellQuote: boolean;

    constructor(attr: CommandLineBinding | string) {
        if (typeof attr === 'string') {
            this.value = attr;
        } else if (typeof attr === 'object') {
            this.position = attr.position;
            this.prefix = attr.prefix;
            this.separate = attr.separate;
            this.itemSeparator = attr.itemSeparator;
            this.valueFrom = attr.valueFrom;
            this.shellQuote = attr.shellQuote;
        } else {
            throw("Invalid argument errors");
        }
    }

    getCommandPart(jobInputs?: any): CommandLinePart {
        let position  = this.position || 0;

        if (this.value) {
            return new CommandLinePart(this.value, "argument");
        }

        let prefix    = this.prefix || "";
        let separator = (!!prefix && this.separate !== false) ? " " : "";
        let value = this.evaluate(this.valueFrom, jobInputs);
        let calculatedValue = '';

        if (Array.isArray(value)) {
            // evaluate as array
            if (this.itemSeparator) {
                calculatedValue = prefix + separator + value.join(this.itemSeparator + " ");
            } else {
                calculatedValue = value.map((val) => {
                    return prefix + separator + val;
                }).join(" ");
            }
        } else {
            calculatedValue = prefix + separator + value;
        }

        return new CommandLinePart(calculatedValue, "argument");
    }

    private evaluate(valueFrom: string|Expression, jobInputs: any): any {
        return valueFrom ? ExpressionEvaluator.evaluate(valueFrom, jobInputs) : "";
    }
}