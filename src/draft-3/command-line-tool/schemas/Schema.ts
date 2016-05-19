import {SecondaryFileList, IOFormat} from "../Symbols";

export interface Schema {
    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;
}