import {PrimitiveType} from "../Symbols";
import {CommandOutputRecordSchema} from "./CommandOutputRecordSchema";
import {CommandOutputEnumSchema} from "./CommandOutputEnumSchema";
import {CommandOutputBinding} from "../bindings";
import {Schema} from "./Schema";

export interface CommandOutputArraySchema extends Schema {
    type: "array";

    items: PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string | Array<PrimitiveType | CommandOutputRecordSchema | CommandOutputEnumSchema | CommandOutputArraySchema | string>;

    outputBinding?: CommandOutputBinding;
}