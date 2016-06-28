import {CommandInputParameter} from "../../mappings/draft-4/CommandInputParameter";
import {Identifiable} from "../interfaces/Identifiable";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";

export class CommandInputParameterModel implements CommandInputParameter, CommandLineInjectable, Identifiable {
    getCommandPart(): CommandLinePart {
        return undefined;
    }

    id: string;
}