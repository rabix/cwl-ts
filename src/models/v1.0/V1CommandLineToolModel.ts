import {CommandLineTool, Expression, ProcessRequirement} from "../../mappings/v1.0/";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {ensureArray, spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {CommandInputParameter} from "../../mappings/v1.0/CommandInputParameter";
import {CommandOutputParameter} from "../../mappings/v1.0/CommandOutputParameter";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {DockerRequirementModel} from "../generic/DockerRequirementModel";
import {DockerRequirement} from "../../mappings/v1.0/DockerRequirement";

export class V1CommandLineToolModel extends CommandLineToolModel {

    public cwlVersion = "v1.0";

    public inputs: Array<V1CommandInputParameterModel>   = [];
    public outputs: Array<V1CommandOutputParameterModel> = [];

    public id: string;
    public label: string;
    public description: string;

    public baseCommand: Array<V1ExpressionModel> = [];

    public arguments: Array<V1CommandArgumentModel> = [];
    public stdin: V1ExpressionModel;
    public stdout: V1ExpressionModel;
    public stderr: V1ExpressionModel;

    public hasStdErr = true;

    public successCodes: Array<number>;
    public temporaryFailCodes: Array<number>;
    public permanentFailCodes: Array<number>;

    public docker: DockerRequirementModel;

    constructor(json: CommandLineTool, loc?: string) {
        super(loc);

        if (json) this.deserialize(json);
    }

    public addOutput(output?: CommandOutputParameter): V1CommandOutputParameterModel {
        const o = new V1CommandOutputParameterModel(output, `${this.loc}.outputs[${this.outputs.length}]`);
        this.outputs.push(o);

        o.setValidationCallback(err => this.updateValidity(err));
        return o;
    }

    public addInput(input?): V1CommandInputParameterModel {
        const i = new V1CommandInputParameterModel(input, `${this.loc}.inputs[${this.inputs.length}]`);
        this.inputs.push(i);

        i.setValidationCallback(err => this.updateValidity(err));
        return i;
    }

    public addArgument(arg?: CommandLineBinding | string): V1CommandArgumentModel {
        const a = new V1CommandArgumentModel(arg, `${this.loc}.arguments[${this.arguments.length}]`);
        this.arguments.push(a);

        a.setValidationCallback(err => this.updateValidity(err));
        return a;
    }

    public addBaseCommand(cmd?: Expression | string): V1ExpressionModel {
        const b = new V1ExpressionModel(cmd, `${this.loc}.baseCommand[${this.baseCommand.length}]`);
        this.baseCommand.push(b);

        b.setValidationCallback(err => this.updateValidity(err));
        return b;
    }

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        this.createReq(req, null, hint);
    }

    private createReq(req: ProcessRequirement, loc?: string, hint?: boolean): ProcessRequirementModel {
        let reqModel: ProcessRequirementModel;
        const property = hint ? "hints" : "requirements";
        loc            = loc || `${this.loc}.${property}[${this[property].length}]`;

        switch (req.class) {
            case "DockerRequirement":
                this.docker = new DockerRequirementModel(req, this.docker ? this.docker.loc : loc);
                this.docker.setValidationCallback(err => this.updateValidity(err));
                return;
        }

        if (reqModel) {
            (this[property] as Array<ProcessRequirementModel>).push(reqModel);
            reqModel.setValidationCallback((err) => this.updateValidity(err));
        }

    }

    public updateStream(stream: V1ExpressionModel, type) {
        this[type] = stream;
        stream.loc = `${this.loc}.${type}`;
        stream.setValidationCallback(err => this.updateValidity(err));
    }

    public deserialize(tool: CommandLineTool) {
        const serializedKeys = ["baseCommand", "stdout", "stdin", "stderr", "inputs", "outputs", "id", "class", "cwlVersion", "doc", "label",
            "arguments", "hints"];

        this.id          = tool.id;
        this.description = tool.doc;
        this.label       = tool.label;

        ensureArray(tool.inputs, "id", "type").map(inp => this.addInput(inp));
        ensureArray(tool.outputs, "id", "type").map(out => this.addOutput(out));
        ensureArray(tool.baseCommand).map(cmd => this.addBaseCommand(cmd));

        ensureArray(tool.hints, "class", "value").map((h, i) => this.createReq(h, null, true));

        // this.requirements = tool.requirements;
        this.arguments = ensureArray(tool.arguments).map(arg => this.addArgument(arg));

        this.stdin = new V1ExpressionModel(tool.stdin, `${this.loc}.stdin`);
        this.stdin.setValidationCallback(err => this.updateValidity(err));

        this.stdout = new V1ExpressionModel(tool.stdout, `${this.loc}.stdout`);
        this.stdout.setValidationCallback(err => this.updateValidity(err));

        this.stderr = new V1ExpressionModel(tool.stderr, `${this.loc}.stderr`);
        this.stderr.setValidationCallback(err => this.updateValidity(err));


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

        // HINTS
        base.hints = [];

        if (this.hints.length) {
            this.hints.forEach(h => base.hints.push(h.serialize()));
        }

        if (this.docker) base.hints.push(this.docker.serialize());

        if (!base.hints.length) delete base.hints;

        if (this.stdin.serialize() !== undefined) base.stdin = this.stdin.serialize();
        if (this.stdout.serialize() !== undefined) base.stdout = this.stdout.serialize();
        if (this.stderr.serialize() !== undefined) base.stderr = this.stderr.serialize();


        if (this.arguments.length) base.arguments = this.arguments.map(a => a.serialize());

        return spreadAllProps(base, this.customProps);
    }
}