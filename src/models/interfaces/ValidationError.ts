export type ValidationType = "Error" | "Warning" | "Info" | "Suggestion";

export interface ValidationError {
    type: ValidationType;
    message: string;
    location: string; // property where error occurred
    name?: string; // name or id of property
}