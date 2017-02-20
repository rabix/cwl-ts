export type CommandType = "baseCommand" | "input" | "argument" | "stdin" | "stdout" | "error" | "warning"

export class CommandLinePart {
    public value: string;

    public loc: string;
    public type: CommandType;

    constructor(value: string, type: CommandType, loc?: string) {
        value      = value === undefined ? '' : value; // in case expression returned undefined
        value      = value.toString(); // in case expression returned something other than a string
        this.value = value.trim();
        this.type  = type;
        this.loc   = loc;
    }
}
