import {SecondaryFileList, IOFormat} from "../aggregate-types";

export interface Schema {
    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;
}