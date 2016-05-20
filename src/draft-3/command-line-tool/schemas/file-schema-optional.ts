import {SecondaryFileList, IOFormat} from "../aggregate-types";

export interface FileSchemaOptional {
    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;
}