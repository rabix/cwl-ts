import {CommandLinePart} from "./CommandLinePart";
import {TypeResolver} from "./TypeResolver";
import {CommandLinePrepare} from "./CommandLinePrepare";
import {ExpressionModel} from "../d2sb/ExpressionModel";
export class CommandLineParsers {

    static primitive(input, job, value, context, cmdType): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);
        const prefix    = input.inputBinding.prefix || "";
        const separator = input.inputBinding.separate !== false ? " " : "";
        value           = value || job[input.id];
        value           = value.path ? value.path : value;

        // if (input.inputBinding.valueFrom &&  input.inputBinding.valueFrom) {
        //     return CommandLinePrepare.prepare(input.inputBinding.valueFrom, job, context.$job, cmdType).then(suc => {
        //        debugger;
        //     });
        // }
        return new Promise(res => {
            res(new CommandLinePart(prefix + separator + value, [], cmdType));
        });
    }

    static boolean(input, job, value, context, type): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);

        let result        = "";
        let prefix        = input.inputBinding.prefix || "";
        const itemsPrefix = (input.type.typeBinding && input.type.typeBinding.prefix)
            ? input.type.typeBinding.prefix : '';
        const separator   = input.inputBinding.separate !== false ? " " : "";
        value             = value || job[input.id];

        if (value) {
            prefix = input.type.items === "boolean" ? itemsPrefix : prefix;

            if (input.inputBinding.valueFrom) {
                return input.inputBinding.valueFrom.evaluate({$job: job, $self: job[input.id]})
                    .then(res => {
                        return new CommandLinePart(prefix + separator + res, [], type);
                    }, err => {
                        return new CommandLinePart(`<${err.type} at ${err.loc}>`, [], err.type);
                    });
            }

            result = prefix;
        }

        return new Promise(res => {
            res(new CommandLinePart(result, [], type));
        });
    }

    static record(input, job, value, context, cmdType): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);

        const prefix    = input.inputBinding.prefix || "";
        const separator = input.inputBinding.separate !== false ? " " : "";

        return new Promise(res => {
            res(new CommandLinePart(prefix + separator, [], cmdType));
        });
    }

    static array(input, job, value, context, cmdType): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);
        value = value || job[input.id];

        const prefix        = input.inputBinding.prefix || "";
        const separator     = input.inputBinding.separate !== false ? " " : "";
        const itemSeparator = input.inputBinding.itemSeparator || "";

        if (itemSeparator) {
            return new Promise(res => {
                res(new CommandLinePart(prefix + separator + value.join(itemSeparator), [], cmdType))
            });
        } else {
            return Promise.all(value.map((val, index) => {
                return Object.assign({}, input, {
                    id: index,
                    type: input.type.items,
                    inputBinding: input.type.typeBinding || {}
                }, {items: undefined});
            }).map((item) => {
                return CommandLinePrepare.prepare(item, value, value[item.id]);
            })).then((res: CommandLinePart[]) => {
                return new CommandLinePart(prefix + separator + res.map(part => part.value).join(" "), [], cmdType);
            });
        }
    }

    static expression(expr: ExpressionModel, job, value, context, cmdType): Promise<any> {
        return expr.evaluate(context).then(res => {
            return res;
        }, err => {
            return new CommandLinePart(`<${err.type} at ${err.loc}>`, [], err.type);
        });
    }

    static argument(arg, job, value, context, cmdType): Promise<CommandLinePart> {
        if (arg.stringVal) {
            return new Promise(res => {
                res(new CommandLinePart(arg.stringVal, [], "argument"));
            });
        }

        const prefix = arg.prefix || "";
        const separator = arg.separate !== false ? " " : "";

        if (arg.valueFrom) {
            return CommandLinePrepare.prepare(arg.valueFrom, job, context.$job).then(res => {
                return new CommandLinePart(prefix + separator + res, [], cmdType);
            });
        }

        return new Promise(res => {
            res(new CommandLinePart(prefix, [], "input"));
        });
    }

    static stream(stream, job, value, context, cmdType): Promise<CommandLinePart>{
        if (stream instanceof ExpressionModel) {
            return CommandLineParsers.expression(stream, job, value, context, cmdType).then(res => {
                const prefix = res ? (cmdType === "stdin" ? "< " : "> ") : "";
                return new CommandLinePart(prefix + res, [], cmdType);
            });
        }
    }

    static nullValue(): Promise<CommandLinePart> {
        return new Promise(res => {
            res(null);
        });
    }

    static checkMismatch(input, job, value): void {
        value = value || job[input.id];

        // If type declared does not match type of value, throw error
        if (!TypeResolver.doesTypeMatch(input.type.type, value)) {
            // If there are items, only throw exception if items don't match either
            if (!input.type.items || !TypeResolver.doesTypeMatch(input.type.items, value)) {
                // should be warning on input, not throw an exception
                // throw(`Mismatched value and type definition expected for ${input.id}. ${input.type.type}
                // or ${input.type.items}, but instead got ${typeof value}`);
            }
        }
    }
}