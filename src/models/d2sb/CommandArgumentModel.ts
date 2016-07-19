import {CommandLineBinding} from "../../mappings/d2sb/CommandLineBinding";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";

export class CommandArgumentModel implements CommandLineInjectable {

    part: CommandLinePart;

    constructor(arg: string | CommandLineBinding) {
        if (typeof arg === "object") {
            console.warn("CommandArgumentModel not implemented yet");
            this.part = new CommandLinePart('', 0);
        } else if (typeof arg === 'string') {
            this.part = new CommandLinePart(arg, 0);
        }
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {
        return this.part;
    }

}