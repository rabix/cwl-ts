import {CommandInputParameter} from "../../mappings/draft-4/CommandInputParameter";
import {CommandLineInjectable} from "../interfaces/CommandLineInjectable";
import {CommandLinePart} from "../helpers/CommandLinePart";
import {CWLType} from "../../mappings/draft-3/CWLType";
import {CommandInputRecordSchema} from "../../mappings/draft-4/CommandInputRecordSchema";
import {CommandInputEnumSchema} from "../../mappings/draft-4/CommandInputEnumSchema";
import {CommandInputArraySchema} from "../../mappings/draft-4/CommandInputArraySchema";
import {CommandLineBinding} from "../../mappings/draft-4/CommandLineBinding";
import {Expression} from "../../mappings/draft-4/Expression";
import {Identifiable} from "../interfaces/Identifiable";


export class CommandInputParameterModel implements CommandInputParameter, CommandLineInjectable, Identifiable {
    id: string;

    isRequired: boolean = true;
    items: string;

    type: CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string | Array<CWLType | CommandInputRecordSchema | CommandInputEnumSchema | CommandInputArraySchema | string>;
    inputBinding: CommandLineBinding;
    label: string;
    description: string;
    secondaryFiles: string | Expression | Array<string | Expression>;
    format: string | Array<string> | Expression;
    streamable: boolean;

    constructor(attr: any) {
        this.id             = attr.id ? attr.id : null;
        this.type           = attr.type ? attr.type : null;
        this.inputBinding   = attr.inputBinding ? attr.inputBinding : null;
        this.label          = attr.label ? attr.label : null;
        this.description    = attr.description ? attr.description : null;
        this.secondaryFiles = attr.secondaryFiles ? attr.secondaryFiles : null;
        this.format         = attr.format ? attr.format : null;
        this.streamable     = attr.streamable ? attr.streamable : null;

        let typeResolution = TypeResolver.resolveType(this.type);
        this.type = typeResolution.type;
        this.items = typeResolution.items;
        this.isRequired = typeResolution.isRequired;

        this.validate();
    }

    getCommandPart(job?: any, value?: any, self?: any): CommandLinePart {
        return undefined;
    }


    public validate() {

    }
}

interface TypeResolution {
    type: string;
    items: string;
    isRequired: boolean;
}

class TypeResolver {

    static resolveType(type: any, result?: TypeResolution): TypeResolution {
        result = result || {type: '', items: null, isRequired: true};

        if (typeof type === 'string') {
            let matches = /(\w+)([\[\]?]+)/g.exec(<string> type);
            if (matches) {
                if (/\?/.test(matches[2])) {
                    result.isRequired = false;
                }

                if (/\[]/.test(matches[2])) {
                    result.type = 'array';
                    result.items = matches[1];
                } else {
                    result.type = matches[1];
                }

                return result;
            } else {
                result.type = type;
                return result;
            }
        } else if (Array.isArray(result.type)) {
            // check if type is required
            let nullIndex = (<Array<any>> type).indexOf('null');

            if (nullIndex > -1) {
                result.isRequired = false;
                type.splice(nullIndex, 1);
            }

            if (type.length !== 1) {
                throw("Union types not supported yet! Sorry");
            }

            if (typeof type[0] === 'string') {
                return TypeResolver.resolveType(type[0], result);
            } else {
                // resolve object type
            }
        } else {
            // resolve object type
        }

        return result;

    }
}