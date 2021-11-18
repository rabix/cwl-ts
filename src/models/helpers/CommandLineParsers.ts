import {ExpressionModel} from "../generic/ExpressionModel";
import {CommandLinePart} from "./CommandLinePart";
import {CommandLinePrepare} from "./CommandLinePrepare";
import {TypeResolver} from "./TypeResolver";
import {V1CommandArgumentModel} from "../v1.0/V1CommandArgumentModel";
import {V1ExpressionModel} from "../v1.0/V1ExpressionModel";
import {ErrorCode} from "./validation";

export class CommandLineParsers {

    static primitive(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);

        const prefix      = input.inputBinding.prefix || "";
        const separator   = input.inputBinding.separate !== false ? " " : "";
        const valueExists = value !== undefined && value !== null;

        let checkedValue = valueExists ? value : job[input.id];

        if (checkedValue !== null && checkedValue !== undefined) {
            if (checkedValue.hasOwnProperty("path")) {
                checkedValue = checkedValue.path;
            } else if (checkedValue.hasOwnProperty("location")) {
                checkedValue = checkedValue.location;
            }
        }

        if (input.inputBinding.valueFrom && input.inputBinding.valueFrom.serialize() !== undefined) {
            return input.inputBinding.valueFrom.evaluate(context)
                .then(res => {
                    return new CommandLinePart(prefix + separator + res, cmdType, loc);
                }, err => {
                    if (err.type === "warning" && err.code === ErrorCode.EXPR_LINTER_WARNING) {
                        const evaluation = err.payload.evaluation == null ? "" : err.payload.evaluation;
                        return new CommandLinePart(prefix + separator + evaluation, cmdType, loc);
                    }
                    return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
                });
        }

        return new Promise(res => {
            res(new CommandLinePart(prefix + separator + checkedValue, cmdType, loc));
        });
    }

    static string(input, job, value, context, type, loc): Promise<CommandLinePart> {
        return new Promise((res, rej) => {
            res(new CommandLinePart(input, type, loc));
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

            if (input.inputBinding.valueFrom && input.inputBinding.valueFrom.serialize() !== undefined) {
                return input.inputBinding.valueFrom.evaluate(context)
                    .then(res => {
                        return new CommandLinePart(prefix + separator + res, type, loc);
                    }, err => {
                        if (err.type === "warning" && err.code === ErrorCode.EXPR_LINTER_WARNING) {
                            const evaluation = err.payload.evaluation == null ? "" : err.payload.evaluation;
                            return new CommandLinePart(prefix + separator + evaluation, type, loc);
                        }
                        return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
                    });
            }

            result = prefix;
        }

        return new Promise(res => {
            res(new CommandLinePart(result, type, loc));
        });
    }

    static async record(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);

        const prefix    = input.inputBinding.prefix || "";
        const separator = input.inputBinding.separate !== false ? " " : "";

        // input.fields will be populated if the record is part of an array (input.type is overwritten by the item type)
        // input.type.fields will be populated if the record is not in an array
        // the empty array is passed in case the type of input isn't really a record, but its value in the job was malformed
        // to make it look like it is a record, in this case the parser will return nothing
        const flatFields = await CommandLinePrepare.flattenInputsAndArgs(input.fields || input.type.fields || [], context);
        const flatRecordValue = CommandLinePrepare.flattenJob(value, {});


        // context is probably the wrong context here, it should be the context on the tool level for the field
        return Promise.all(flatFields.map(field => {
            return CommandLinePrepare.prepare(field, flatRecordValue, context, loc);
        })).then(parts => {
            return new CommandLinePart(prefix +  separator + parts.map(p => p.value).join(" "), cmdType, loc);
        });
    }

    static array(input, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        CommandLineParsers.checkMismatch(input, job, value);
        value = value || job[input.id] || [];
        value = value.map(val => val && val.hasOwnProperty("path") ? val.path : val);

        const prefix        = input.inputBinding.prefix || "";
        const separator     = input.inputBinding.separate !== false ? " " : "";
        let itemSeparator = typeof input.inputBinding.itemSeparator === "string" ?
            input.inputBinding.itemSeparator : " ";

        // Cannot import SBDraft2CommandLineBindingModel since its then a circular dependency
        // So check if its SBDraft2 by checking if does not have flag hasSecondaryFiles
        if (!input.hasSecondaryFiles &&
            (input.inputBinding.itemSeparator === null || input.inputBinding.itemSeparator === undefined)) {
            itemSeparator = prefix ? ` ${prefix}${separator}` : " ";
        }

        if (input.inputBinding.valueFrom && input.inputBinding.valueFrom.serialize() !== undefined) {
            return input.inputBinding.valueFrom.evaluate(context)
                .then(res => {
                    return new CommandLinePart(prefix + separator + res, cmdType, loc);
                }, err => {
                    if (err.type === "warning" && err.code === ErrorCode.EXPR_LINTER_WARNING) {
                        const evaluation = err.payload.evaluation == null ? "" : err.payload.evaluation;
                        return new CommandLinePart(prefix + separator + evaluation, cmdType, loc);
                    }
                    return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
                });
        }

        return (Promise.all(value.map((val, index) => {
                return Object.assign({}, input, {
                    id: index,
                    type: input.type.items,
                    fields: input.type.fields,
                    inputBinding: input.type.typeBinding || {}
                }, {items: undefined});
            }).map((item: any): Promise<CommandLinePart> => {
                return CommandLinePrepare.prepare(item, value, value[item.id]) as Promise<CommandLinePart>;
            })
        ) as Promise<any>).then((res: Array<CommandLinePart>) => {
            const partValuesSeparated = res.map(part => part.value).join(itemSeparator);

            // Check against hasSecondaryFiles flag to make sure it's CWL v1.0
            const partValues = input.hasSecondaryFiles && typeof input.inputBinding.itemSeparator === "string"
                ? `'${partValuesSeparated}'`
                : partValuesSeparated;

            return new CommandLinePart(prefix + separator + partValues, cmdType, loc);
        });

    }

    static expression(expr: ExpressionModel, job, value, context, cmdType, loc): Promise<any> {
        return expr.evaluate(context).then(res => {
            return res === undefined ? "" : res;
        }, err => {
            if (err.type === "warning" && err.code === ErrorCode.EXPR_LINTER_WARNING) {
                return err.payload.evaluation == null ? "" : err.payload.evaluation;
            }
            return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
        });
    }

    static argument(arg, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        if (arg.primitive) {
            if (arg instanceof V1CommandArgumentModel) {
                const expr = new V1ExpressionModel(arg.primitive, arg.loc);
                if (expr.isExpression) {
                    return CommandLineParsers.expression(expr, job, value, context, cmdType, loc).then(res => {
                        if (res instanceof CommandLinePart) return res;
                        return new CommandLinePart(res, "argument", loc);
                    });
                }
            }

            return new Promise(res => {
                res(new CommandLinePart(arg.primitive, "argument", loc));
            });
        }

        const prefix    = arg.prefix || "";
        const separator = arg.separate !== false ? " " : "";

        if (arg.valueFrom) {
            return CommandLinePrepare.prepare(arg.valueFrom, job, context, loc).then(res => {

                if (res.toString() == "") {
                    return new CommandLinePart("", cmdType, loc);
                }

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

    static stdin(input, job, value, context, cmdType, loc) : Promise<CommandLinePart> {

        let checkedValue = (value !== undefined && value !== null) ? value : job[input.id];

        if (checkedValue && checkedValue.hasOwnProperty("path")) {
            checkedValue = checkedValue.path;
        }

        const result = checkedValue ? `< ${checkedValue}` : "";

        return new Promise(res => {
            res(new CommandLinePart(result, cmdType, loc));
        });

    }

    static stream(stream, job, value, context, cmdType, loc): Promise<CommandLinePart> {
        if (stream instanceof ExpressionModel) {
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
