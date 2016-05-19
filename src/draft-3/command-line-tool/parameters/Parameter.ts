import {SecondaryFileList, IOFormat} from "../aggregate-types";
export interface Parameter {

    id: string;

    secondaryFiles?: SecondaryFileList;

    format?: IOFormat;

    streamable?: boolean;

    label?: string;

    description?: string;

}