import {CommandOutputParameter} from "../../mappings/d2sb/CommandOutputParameter";
import {Datatype} from "../../mappings/d2sb/Datatype";
import {CommandOutputSchema} from "../../mappings/d2sb/CommandOutputSchema";
import {CommandOutputBinding} from "../../mappings/d2sb/CommandOutputBinding";

export class CommandOutputParameterModel implements CommandOutputParameter {
    id: string;
    type: Datatype | CommandOutputSchema | string | Array<Datatype | CommandOutputSchema | string>;
    outputBinding: CommandOutputBinding;
    label: string;
    description: string;

    constructor(attr: CommandOutputParameter) {
        this.id            = attr.id;
        this.outputBinding = attr.outputBinding;
        this.type          = attr.type;
        this.label         = attr.label;
        this.description   = attr.description;
    }
}