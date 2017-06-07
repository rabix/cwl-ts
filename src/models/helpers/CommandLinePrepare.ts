import {CommandLineParsers} from "./CommandLineParsers";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ExpressionModel} from "../generic/ExpressionModel";

import {CommandLinePart, CommandType} from "./CommandLinePart";

export class CommandLinePrepare {

    static prepare(input, flatJobInputs, context, loc?: string, cmdType?: CommandType): Promise<CommandLinePart | string> {
        let inputType = "primitive";

        if (!input) {
            inputType === "nullValue";
        }

        if (input instanceof CommandInputParameterModel || input.type === "record") {
            const value = flatJobInputs[input.id] || null;
            cmdType = "input";

            if (value === null) {
                inputType = "nullValue";
            } else if (Array.isArray(value)) {
                inputType = "array";
            } else if (typeof value === "boolean") {
                inputType = "boolean";
            } else if (typeof value === "object" && value.class !== "File") {
                inputType = "record";
            }
        }

        if (input instanceof CommandArgumentModel) {
            inputType = "argument";
            cmdType = "argument";
        }

        if (input instanceof ExpressionModel) {
            inputType = "expression";
        }

        if (cmdType === "stdin" || cmdType === "stdout") {
            inputType = "stream";
        }

        if (typeof input === "string") {
            inputType = "string";
        }

        let parser = CommandLineParsers[inputType];

        return parser(input, flatJobInputs, flatJobInputs[input.id || null], context, cmdType, loc);
    };

    static flattenInputsAndArgs(inputs: Array<CommandInputParameterModel | CommandArgumentModel>): Array<CommandInputParameterModel | CommandArgumentModel> {
        return inputs.filter(input => {
            if (input instanceof CommandInputParameterModel) {
                return !!input.inputBinding;
            }
            return true;
        }).reduce((acc, input, index) => {
            const sortFn = (a, b) => {
                let c1, c2;
                [c1, c2] = [a, b].map(a => {
                    return a instanceof CommandArgumentModel ?
                        {pos: ~~a.position, id: index.toString()} :
                        {pos: ~~a.inputBinding.position, id: a.id};
                });

                return ~~c1.pos - ~~c2.pos || (c1.id ? c1.id.localeCompare(c2.id) : -1);
            };

            if (input instanceof CommandInputParameterModel) {
                if (input.type.fields) {
                    return acc.concat(input, ...CommandLinePrepare.flattenInputsAndArgs(input.type.fields).sort(sortFn));
                }
            }

            return acc.concat(input).sort(sortFn);
        }, []);
    }

    static flattenJob(job: any, master: any) {
        return Object.keys(job).reduce((acc, key) => {
            if (job[key] === null) return Object.assign(master, {[key]: null});

            if (typeof job[key] === "object" && job[key].class !== "File") {
                return Object.assign(master, {[key]: job[key]}, CommandLinePrepare.flattenJob(job[key], {}));
            }

            return Object.assign(master, {[key]: job[key]});
        }, {});
    }
}