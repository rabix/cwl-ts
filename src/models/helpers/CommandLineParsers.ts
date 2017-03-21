import {CommandLinePart} from "./CommandLinePart";
import {TypeResolver} from "./TypeResolver";
import {CommandLinePrepare} from "./CommandLinePrepare";
import {SBDraft2ExpressionModel} from "../d2sb/SBDraft2ExpressionModel";
export class CommandLineParsers {

    static primitive(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);
        const prefix    = input.inputBinding.prefix || "";
        const separator = input.inputBinding.separate !== false ? " " : "";
        value           = value || job[input.id];
        value           = value.hasOwnProperty("path") ? value.path : value;

        // if (input.inputBinding.valueFrom &&  input.inputBinding.valueFrom) {
        //     return CommandLinePrepare.prepare(input.inputBinding.valueFrom, job, context.$job, cmdType).then(suc => {
        //     });
        // }
        return new Promise(res => {
            res(new CommandLinePart(prefix + separator + value, cmdType, loc));
        });
    }

    static boolean(input, job, value, context, type, loc): Promise<CommandLinePart> {
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
                        return new CommandLinePart(prefix + separator + res, type, loc);
                    }, err => {
                        return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
                    });
            }

            result = prefix;
        }

        return new Promise(res => {
            res(new CommandLinePart(result, type, loc));
        });
    }

    static record(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);

        const prefix    = input.inputBinding.prefix || "";
        const separator = input.inputBinding.separate !== false ? " " : "";

        return new Promise(res => {
            res(new CommandLinePart(prefix + separator, cmdType, loc));
        });
    }

    static array(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);
        value = value || job[input.id] || [];
        value = value.map(val => val.hasOwnProperty("path") ? val.path : val);

        const prefix        = input.inputBinding.prefix || "";
        const separator     = input.inputBinding.separate !== false ? " " : "";
        const itemSeparator = typeof input.inputBinding.itemSeparator === "string" ?
            input.inputBinding.itemSeparator : " ";

        return Promise.all(value.map((val, index) => {
            return Object.assign({}, input, {
                id: index,
                type: input.type.items,
                inputBinding: input.type.typeBinding || {}
            }, {items: undefined});
        }).map((item) => {
            return CommandLinePrepare.prepare(item, value, value[item.id]);
        })).then((res: CommandLinePart[]) => {
            return new CommandLinePart(prefix + separator + res.map(part => part.value).join(itemSeparator), cmdType, loc);
        });

    }

    static expression(expr: SBDraft2ExpressionModel, job, value, context, cmdType, loc): Promise<any> {
        return expr.evaluate(context).then(res => {
            return res;
        }, err => {
            return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
        });
    }

    static argument(arg, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        if (arg.primitive) {
            return new Promise(res => {
                res(new CommandLinePart(arg.primitive, "argument", loc));
            });
        }

        const prefix    = arg.prefix || "";
        const separator = arg.separate !== false ? " " : "";

        if (arg.valueFrom) {
            return CommandLinePrepare.prepare(arg.valueFrom, job, context.$job).then(res => {
                if (res instanceof CommandLinePart) {
                    return res;
                }
                return new CommandLinePart(prefix + separator + res, cmdType, loc);
            });
        }

        return new Promise(res => {
            res(new CommandLinePart(prefix, "input", loc));
        });
    }

    static stream(stream, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        if (stream instanceof SBDraft2ExpressionModel) {
            return CommandLineParsers.expression(stream, job, value, context, cmdType, loc).then(res => {
                if (res instanceof CommandLinePart) {
                    return res;
                } else {
                    const prefix = res ? (cmdType === "stdin" ? "< " : "> ") : "";
                    return new CommandLinePart(prefix + res, cmdType, loc);
                }
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

        if (input === null || input.type === null) {
            return;
        }
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