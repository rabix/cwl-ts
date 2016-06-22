import {RecordField} from "./RecordField";
import {OutputBinding} from "./OutputBinding";


export interface OutputRecordField extends RecordField {


    outputBinding?: OutputBinding;

}