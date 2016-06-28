import {CommandLinePart} from "../helpers/CommandLinePart";

export interface CommandLineInjectable {
    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart;
}