import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {CommandLineBinding} from "../../mappings/draft-4/CommandLineBinding";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {Expression} from "../../mappings/draft-4/Expression";

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
            this.position = attr.position || null;
            this.prefix = attr.prefix || null;
            this.separate = attr.separate || null;
            this.itemSeparator = attr.itemSeparator || null;
            this.valueFrom = attr.valueFrom || null;
            this.shellQuote = attr.shellQuote || null;
        } else {
            throw("Invalid argument error");
        }
    }

    getCommandPart(job?: any): CommandLinePart {
        let position  = this.position || 0;

        if (this.value) {
            return new CommandLinePart(this.value, position)
        }

        let prefix    = this.prefix || "";
        let separator = (!!prefix && this.separate !== false) ? " " : "";
        let value = this.evaluate(this.valueFrom, job);
        let calculatedValue = '';

        if (Array.isArray(value)) {
            // evaluate as array
            if (this.itemSeparator) {
                calculatedValue = prefix + separator + value.join(this.itemSeparator + " ");
            } else {
                calculatedValue = value.map((val) => {
                    return prefix + separator + val;
                });
            }
        } else {
            calculatedValue = prefix + separator + value;
        }

        return new CommandLinePart(calculatedValue, position);
    }

    private evaluate(valueFrom: string|Expression, job: any): any {
        //@todo(maya): implement expression evaluation
        return valueFrom || '';
    }
}