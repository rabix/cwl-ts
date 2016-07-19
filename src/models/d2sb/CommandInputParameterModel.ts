import {CommandInputParameter} from "../../mappings/d2sb/CommandInputParameter";
import {CommandLineInjectable} from "../../models/interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";

export class CommandInputParameterModel implements CommandInputParameter, CommandLineInjectable{
    id: string;

    constructor(input: CommandInputParameter) {
        console.warn("CommandInputParameterModel not implemented yet");
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {
        console.warn("CommandInputParameterModel does not have command part");
        return new CommandLinePart('', 0);
    }

}