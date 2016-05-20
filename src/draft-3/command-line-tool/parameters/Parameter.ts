import {FileSchemaOptional} from "../schemas/file-schema-optional";

export interface Parameter extends FileSchemaOptional {

    id: string;

    label?: string;

    description?: string;
}