import {SecondaryFileList, IOFormat} from "../aggregate-types";

export interface FileArraySchema {
    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;
}