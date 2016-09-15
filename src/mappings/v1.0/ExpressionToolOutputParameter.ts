import {OutputParameter} from "./OutputParameter";
import {CWLType} from "./CWLType";
import {OutputRecordSchema} from "./OutputRecordSchema";
import {OutputEnumSchema} from "./OutputEnumSchema";
import {OutputArraySchema} from "./OutputArraySchema";


export interface ExpressionToolOutputParameter extends OutputParameter {


    /**
     * Specify valid types of data that may be assigned to this parameter.
     *
     */
        type?: CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string | Array<CWLType | OutputRecordSchema | OutputEnumSchema | OutputArraySchema | string>;

}