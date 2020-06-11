import {CommandLineParsers} from "./CommandLineParsers";
import {CommandArgumentModel} from "../generic/CommandArgumentModel";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {ExpressionModel} from "../generic/ExpressionModel";

import {CommandLinePart, CommandType} from "./CommandLinePart";
import {isType} from "./utils";

export class CommandLinePrepare {

    static prepare(input, flatJobInputs, context, loc?: string, cmdType?: CommandType): Promise<CommandLinePart> {
        let inputType = "primitive";
        const isFileOrDirectory = isType(input, ["File", "Directory", "stdin"]);

        if (!input) {
            inputType === "nullValue";
        }

        if (input instanceof CommandInputParameterModel || input.type === "record") {
            const value = flatJobInputs[input.id] !== undefined ? flatJobInputs[input.id] : null;
            cmdType     = "input";

            if (value === null) {
                inputType = "nullValue";
            } else if (Array.isArray(value)) {
                inputType = "array";
            } else if (typeof value === "boolean") {
                inputType = "boolean";
            } else if (typeof value === "object" && value.class !== "File" && value.class !== "Directory" && value.class !== 'stdin' && !isFileOrDirectory) {
                inputType = "record";
            }
        }

        if (input instanceof CommandArgumentModel) {
            inputType = "argument";
            cmdType   = "argument";
        }

        if (input instanceof ExpressionModel) {
            inputType = "expression";
        }

        if (cmdType === "stdin" || cmdType === "stdout") {
            inputType = "stream";
        }

        if (isType(input, "stdin")) {
            inputType = "stdin";
        }

        if (typeof input === "string") {
            inputType = "string";
        }

        let parser = CommandLineParsers[inputType];

        return parser(input, flatJobInputs, flatJobInputs[input.id === undefined ? null : input.id], context, cmdType, loc);
    };

    static async flattenInputsAndArgs(inputs: Array<CommandInputParameterModel | CommandArgumentModel>, context: any)
        : Promise<Array<CommandInputParameterModel | CommandArgumentModel>> {

        const items = inputs.filter(input => {
            if (input instanceof CommandInputParameterModel) {
                return !!input.inputBinding;
            }
            return true;
        });

        const getPosition = async (pos: any) => {
            return ~~(pos instanceof ExpressionModel ? await pos.evaluate(context) : pos);
        }

        const mapFnc = async (input, index) => {
            let position, id;

            if (input instanceof CommandArgumentModel) {
                position = input.position;
                id = index.toString()
            } else {
                position = input.inputBinding.position;
                id = input.id;
            }

            return [input, await getPosition(position), id];
        }

        const reduced = await Promise.all(items.map(mapFnc))

        return reduced.sort((a, b) => {
            return (a[1] - b[1]) || (a[2] ? a[2].localeCompare(b[2]) : -1)
        }).map(a => a[0]);

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
