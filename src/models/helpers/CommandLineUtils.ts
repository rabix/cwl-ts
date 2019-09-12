import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {CommandLinePart} from "./CommandLinePart";
import {CommandLinePrepare} from "./CommandLinePrepare";
import {isEmpty} from "./utils";
import {JobHelper} from "./JobHelper";

export const generateCommandLineParts = (tool: CommandLineToolModel, jobInputs, runtime): Promise<CommandLinePart[]> => {
    const flatInputs = CommandLinePrepare.flattenInputsAndArgs([].concat(tool.arguments).concat(tool.inputs));

    const job = isEmpty(jobInputs) ? // if job has not been populated
        {...{inputs: JobHelper.getJobInputs(tool)}, ...{runtime: runtime}} : // supply dummy values
        tool.getContext(); // otherwise use job

    const flatJobInputs = CommandLinePrepare.flattenJob(job.inputs || job, {});

    const baseCmdPromise = tool.baseCommand.map((cmd, index) => {
        const loc = `${tool.loc}.baseCommand[${index}]`;
        return CommandLinePrepare.prepare(cmd, flatJobInputs, tool.getContext(), loc, "baseCommand").then(suc => {
            if (suc instanceof CommandLinePart) return suc;
            return new CommandLinePart(<string>suc, "baseCommand", loc);
        }, err => {
            return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type, loc);
        });
    });

    const inputPromise = flatInputs.map(input => {
        return CommandLinePrepare.prepare(input, flatJobInputs, tool.getContext(input), input.loc)
    }).filter(i => i instanceof Promise).map(promise => {
        return promise.then(succ => succ, err => {
            return new CommandLinePart(`<${err.type} at ${err.loc}>`, err.type);
        });
    });

    const stdInPromise  = CommandLinePrepare.prepare(tool.stdin, flatJobInputs, tool.getContext(), tool.stdin.loc, "stdin");
    const stdOutPromise = CommandLinePrepare.prepare(tool.stdout, flatJobInputs, tool.getContext(), tool.stdout.loc, "stdout");

    return Promise.all([].concat(baseCmdPromise, inputPromise, stdInPromise, stdOutPromise)).then((parts: CommandLinePart[]) => {
        return parts.filter(part => part !== null);
    });
};
