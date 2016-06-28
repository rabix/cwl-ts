import {CommandLinePart} from "../helpers/CommandLinePart";

export interface CommandLineInjectable {
    getCommandPart(): CommandLinePart;
}