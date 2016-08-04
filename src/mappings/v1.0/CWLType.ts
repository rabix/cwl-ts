import {PrimitiveType} from "./PrimitiveType";

/**
 * Extends primitive types with the concept of a file and directory as a builtin type.,File: A File object,Directory: A Directory object
 */
export type CWLType = "File" | "Directory" | PrimitiveType;