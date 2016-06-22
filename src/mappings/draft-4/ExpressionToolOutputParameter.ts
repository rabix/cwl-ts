import {Parameter} from "./Parameter";
import {CWLType} from "./CWLType";
import {RecordSchema} from "./RecordSchema";
import {EnumSchema} from "./EnumSchema";
import {ArraySchema} from "./ArraySchema";


export interface ExpressionToolOutputParameter extends Parameter {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | RecordSchema | EnumSchema | ArraySchema | string | Array<CWLType | RecordSchema | EnumSchema | ArraySchema | string>;

}