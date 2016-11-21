import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {ExpressionEvaluator} from "../helpers/ExpressionEvaluator";
import {ValidationBase} from "../helpers/validation/ValidationBase";

export class CommandArgumentModel extends ValidationBase implements CommandLineInjectable {
    part: CommandLinePart;
    arg: string | CommandLineBinding;

    constructor(loc: string, arg: string | CommandLineBinding) {
        super(loc);
        this.arg = arg;
    }

    getCommandPart(job?: any, value?: any): CommandLinePart {
        if (typeof this.arg === "object") {
            return this.evaluateArg(this.arg, job);
        } else if (typeof this.arg === 'string') {
            return new CommandLinePart(<string> this.arg, 0, "argument");
        }
    }

    evaluateArg(arg: CommandLineBinding, job: any): CommandLinePart {
        const itemSeparator = arg.itemSeparator;
        const separate = arg.separate === false ? '' : ' ';
        const prefix = arg.prefix || '';
        const position = arg.position || 0;

        const valueFrom = typeof arg.valueFrom === 'object'
            ? (ExpressionEvaluator.evaluateD2(arg.valueFrom, job) || '')
            : arg.valueFrom;

        let calculatedValue;

        if (Array.isArray(valueFrom)) {
            calculatedValue = typeof itemSeparator !== 'undefined'
                ? prefix + separate + valueFrom.join(itemSeparator)
                : prefix + valueFrom.join(' ');
        } else {
            calculatedValue = prefix + separate + valueFrom;
        }

        return new CommandLinePart(calculatedValue, position, "argument");
    }

}