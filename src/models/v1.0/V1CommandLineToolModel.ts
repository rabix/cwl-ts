import {CommandLineTool, Expression, ProcessRequirement} from "../../mappings/v1.0/";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {CommandInputParameter} from "../../mappings/v1.0/CommandInputParameter";
import {CommandOutputParameter} from "../../mappings/v1.0/CommandOutputParameter";

export class V1CommandLineToolModel extends CommandLineToolModel {
    public cwlVersion = "v1.0";

    inputs: Array<V1CommandInputParameterModel>;
    outputs: Array<V1CommandOutputParameterModel>;

    id: string;
    requirements: Array<ProcessRequirement>;

    hints: Array<any>;
    label: string;
    description: string;

    baseCommand: Array<V1ExpressionModel>;

    arguments: Array<V1CommandArgumentModel>;
    stdin: string | Expression;
    stdout: string | Expression;
    stderr: string | Expression;

    successCodes: Array<number>;
    temporaryFailCodes: Array<number>;
    permanentFailCodes: Array<number>;

    constructor(json: CommandLineTool, loc?: string) {
        super(loc);

        if (json) this.deserialize(json);
    }

    public deserialize(tool: CommandLineTool) {
        const serializedKeys = ["inputs", "outputs", "id", "class", "cwlVersion", "doc", "label",
            "arguments"];

        this.inputs      = ensureArray(tool.inputs, "id", "type").map(input => new V1CommandInputParameterModel(input));
        this.outputs     = ensureArray(tool.outputs, "id", "type").map(output => new V1CommandOutputParameterModel(output));
        this.baseCommand = ensureArray(tool.baseCommand).map((cmd, index) => new V1ExpressionModel(cmd, `${this.loc}.baseCommand[${index}]`));

        this.id          = tool.id;
        this.description = tool.doc;
        this.label       = tool.label;

        // this.requirements = tool.requirements;
        // this.hints        = tool.hints;
        this.arguments    = ensureArray(tool.arguments).map(arg => new V1CommandArgumentModel(arg));

        // this.stdin  = tool.stdin;
        // this.stderr = tool.stderr;
        // this.stdout = tool.stdout;
        //
        // this.successCodes       = tool.successCodes;
        // this.temporaryFailCodes = tool.temporaryFailCodes;
        // this.permanentFailCodes = tool.permanentFailCodes;

        spreadSelectProps(tool, this.customProps, serializedKeys);
    }

    public serialize() {
        let base: CommandLineTool = {
            class: "CommandLineTool",
            cwlVersion: "v1.0",
            baseCommand: this.baseCommand.map(b => b.serialize()),
            inputs: <CommandInputParameter[]> this.inputs.map(i => i.serialize()),
            outputs: <CommandOutputParameter[]> this.outputs.map(o => o.serialize())
        };

        if (this.arguments.length) base.arguments = this.arguments.map(a => a.serialize());

        return spreadAllProps(base, this.customProps);
    }
}