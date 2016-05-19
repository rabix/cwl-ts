import {SecondaryFileList, IOFormat} from "../Symbols";
export interface Parameter {

    id: string;

    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;

    label?: string;

    description?: string;

}