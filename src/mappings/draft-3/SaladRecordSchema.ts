import {NamedType} from "./NamedType";
import {RecordSchema} from "./RecordSchema";
import {SchemaDefinedType} from "./SchemaDefinedType";
import {SpecializeDef} from "./SpecializeDef";


export interface SaladRecordSchema extends NamedType, RecordSchema, SchemaDefinedType {


    /**
     * If true, this record is abstract and may be used as a base for other
     * records, but is not valid on its own.
     *
     */
        abstract?: boolean;


    /**
     * Indicates that this record inherits fields from one or more base records.
     *
     */
        extends?: string | Array<string>;


    /**
     * Only applies if `extends` is declared.  Apply type specialization using the
     * base record as a template.  For each field inherited from the base
     * record, replace any instance of the type `specializeFrom` with
     * `specializeTo`.
     *
     */
    specialize?: SpecializeDef | Array<SpecializeDef>;

}