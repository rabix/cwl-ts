import {CommandLineTool, ProcessRequirement} from "../../mappings/v1.0/";
import {CommandInputParameter} from "../../mappings/v1.0/CommandInputParameter";
import {CommandLineBinding} from "../../mappings/v1.0/CommandLineBinding";
import {CommandOutputParameter} from "../../mappings/v1.0/CommandOutputParameter";
import {DockerRequirement} from "../../mappings/v1.0/DockerRequirement";
import {InitialWorkDirRequirement} from "../../mappings/v1.0/InitialWorkDirRequirement";
import {ResourceRequirement} from "../../mappings/v1.0/ResourceRequirement";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";
import {DockerRequirementModel} from "../generic/DockerRequirementModel";
import {ProcessRequirementModel} from "../generic/ProcessRequirementModel";
import {RequirementBaseModel} from "../generic/RequirementBaseModel";
import {JobHelper} from "../helpers/JobHelper";
import {
    charSeparatedToArray,
    ensureArray,
    incrementLastLoc,
    snakeCase,
    spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1InitialWorkDirRequirementModel} from "./V1InitialWorkDirRequirementModel";
import {V1ResourceRequirementModel} from "./V1ResourceRequirementModel";
import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";

export class V1CommandLineToolModel extends CommandLineToolModel {

    public cwlVersion = "v1.0";

    public inputs: Array<V1CommandInputParameterModel>   = [];
    public outputs: Array<V1CommandOutputParameterModel> = [];

    public id: string;
    public label: string;
    public description: string;

    public baseCommand: Array<string> = [];

    public arguments: Array<V1CommandArgumentModel> = [];
    public stdin: V1ExpressionModel;
    public stdout: V1ExpressionModel;
    public stderr: V1ExpressionModel;

    public hasStdErr = true;
    public hasPermanentFailCodes = true;


    public docker: DockerRequirementModel;

    public fileRequirement: V1InitialWorkDirRequirementModel;

    public resources: V1ResourceRequirementModel;

    // Context for JavaScript execution
    protected runtime: { ram?: number, cores?: number } = {};

    public setJobInputs(inputs: any): void {
        this.jobInputs = inputs;
    }

    public setRuntime(runtime: any): void {
        this.runtime.cores = runtime.cores || runtime.cpu;
        this.runtime.ram   = runtime.ram || runtime.mem;
    }


    public resetJobDefaults(): void {
        this.jobInputs = JobHelper.getJobInputs(this);
        this.updateCommandLine();
    }

    public getContext(input?: any): any {
        const context: any = {
            runtime: this.runtime,
            inputs: this.jobInputs
        };

        if (input && input instanceof CommandInputParameterModel) {
            if (input.isField) {
                const root = this.findFieldRoot(input, this.jobInputs);
                context.self = root[input.id];
            } else {
                context.self = this.jobInputs[input.id];

            }
        }

        return context;
    };

    constructor(json?: CommandLineTool, loc?: string) {
        super(loc || "document");

        if (json) this.deserialize(json);
        this.constructed = true;
        this.initializeJobWatchers();
    }

    public addHint(hint?: ProcessRequirement | any): RequirementBaseModel {
        const h = new RequirementBaseModel(hint, V1ExpressionModel, `${this.loc}.hints[${this.hints.length}]`);
        h.setValidationCallback(err => this.updateValidity(err));
        this.hints.push(h);

        return h;
    }

    public addOutput(output?: CommandOutputParameter): V1CommandOutputParameterModel {
        return super._addOutput(V1CommandOutputParameterModel, output);
    }

    public addInput(input?): V1CommandInputParameterModel {
        return super._addInput(V1CommandInputParameterModel, input);
    }

    public addArgument(arg?: CommandLineBinding | string): V1CommandArgumentModel {
        const loc = incrementLastLoc(this.arguments, `${this.loc}.arguments`);

        const a = new V1CommandArgumentModel(arg, loc, this.eventHub);
        this.arguments.push(a);

        a.setValidationCallback(err => this.updateValidity(err));
        this.eventHub.emit("argument.create", arg);
        return a;
    }

    public addBaseCommand(cmd?: string): void {
        this.baseCommand.push(cmd);
    }

    public setRequirement(req: ProcessRequirement, hint?: boolean) {
        this.createReq(req, null, hint);
    }

    private createReq(req: ProcessRequirement, loc?: string, hint = false): ProcessRequirementModel {
        let reqModel: ProcessRequirementModel;
        const property = hint ? "hints" : "requirements";
        loc            = loc || `${this.loc}.${property}[${this[property].length}]`;

        switch (req.class) {
            case "DockerRequirement":
                this.docker        = new DockerRequirementModel(req, this.docker ? this.docker.loc || loc : loc);
                this.docker.isHint = hint;
                this.docker.setValidationCallback(err => this.updateValidity(err));
                return;

            case "InitialWorkDirRequirement":
                loc                  = this.fileRequirement ? this.fileRequirement.loc || loc : loc;
                this.fileRequirement = new V1InitialWorkDirRequirementModel(
                    <InitialWorkDirRequirement> req, loc, this.eventHub);
                this.fileRequirement.setValidationCallback(err => this.updateValidity(err));
                this.fileRequirement.isHint = hint;
                return;

            case "ResourceRequirement":
                loc            = this.resources ? this.resources.loc || loc : loc;
                this.resources = new V1ResourceRequirementModel(req, loc, this.eventHub);
                this.resources.setValidationCallback(err => this.updateValidity(err));
                this.resources.isHint = hint;
                return;

            default:
                reqModel        = new RequirementBaseModel(req, V1ExpressionModel, loc);
                reqModel.isHint = hint;
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

    public validate(): Promise<any> {
        this.cleanValidity();
        const promises: Promise<any>[] = [];

        for (let i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i];
            promises.push(input.validate(this.getContext(input)));
        }

        for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];
            promises.push(output.validate(this.getContext()));
        }

        this.checkPortIdUniqueness();

        for (let i = 0; i < this.arguments.length; i++) {
            const argument = this.arguments[i];
            promises.push(argument.validate(this.getContext()));
        }

        // validate streams to make sure expressions are valid
        if (this.stdin) {
            promises.push(this.stdin.validate(this.getContext()));
        }

        if (this.stdout) {
            promises.push(this.stdout.validate(this.getContext()));
        }

        if (this.stderr) {
            promises.push(this.stderr.validate(this.getContext()));
        }

        if (this.resources) {
            promises.push(this.resources.validate(this.getContext()));
        }

        if (this.fileRequirement) {
            promises.push(this.fileRequirement.validate(this.getContext()));
        }

        return Promise.all(promises).then(() => {
            return this.issues;
        });
    }

    public deserialize(tool: CommandLineTool) {
        const serializedKeys = [
            "baseCommand",
            "stdout",
            "stdin",
            "stderr",
            "successCodes",
            "temporaryFailCodes",
            "permanentFailCodes",
            "inputs",
            "outputs",
            "id",
            "class",
            "cwlVersion",
            "doc",
            "label",
            "arguments",
            "hints",
            "requirements",
            "sbg:job"
        ];

        this.id = this.id = tool["sbg:id"] && tool["sbg:id"].split("/").length > 2 ?
            tool["sbg:id"].split("/")[2] :
            snakeCase(tool.id);

        this.description = tool.doc;
        this.label       = tool.label;

        this.baseCommand = charSeparatedToArray(tool.baseCommand, /\s+/);
        ensureArray(tool.inputs, "id", "type").map(inp => this.addInput(inp));
        ensureArray(tool.outputs, "id", "type").map(out => this.addOutput(out));

        this.arguments = ensureArray(tool.arguments).map(arg => this.addArgument(arg));

        ensureArray(tool.hints, "class", "value").map((h, i) => this.createReq(h, null, true));
        ensureArray(tool.requirements, "class", "value").map((r, i) => this.createReq(r));

        let counter = this.requirements.length;
        // create DockerRequirement for manipulation
        if (!this.docker) {
            this.docker = new DockerRequirementModel(<DockerRequirement> {}, `${this.loc}.requirements[${++counter}]`);
        }
        this.docker.setValidationCallback(err => this.updateValidity(err));

        // create InitialWorkDirRequirement for manipulation
        if (!this.fileRequirement) {
            this.fileRequirement = new V1InitialWorkDirRequirementModel(<InitialWorkDirRequirement> {}, `${this.loc}.requirements[${++counter}]`, this.eventHub);
        }
        this.fileRequirement.setValidationCallback(err => this.updateValidity(err));

        // create ResourceRequirement for manipulation
        if (!this.resources) {
            this.resources = new V1ResourceRequirementModel(<ResourceRequirement> {}, `${this.loc}.requirements[${++counter}]`);
        }
        this.resources.setValidationCallback(err => this.updateValidity(err));

        this.stdin = new V1ExpressionModel(tool.stdin, `${this.loc}.stdin`, this.eventHub);
        this.stdin.setValidationCallback(err => this.updateValidity(err));

        this.stdout = new V1ExpressionModel(tool.stdout, `${this.loc}.stdout`, this.eventHub);
        this.stdout.setValidationCallback(err => this.updateValidity(err));

        this.stderr = new V1ExpressionModel(tool.stderr, `${this.loc}.stderr`, this.eventHub);
        this.stderr.setValidationCallback(err => this.updateValidity(err));

        this.runtime = {cores: 1, ram: 1000};

        if (tool["sbg:job"]) {
            this.jobInputs = {...JobHelper.getNullJobInputs(this), ...tool["sbg:job"].inputs};
            this.runtime   = {...this.runtime, ...tool["sbg:job"].runtime};
        } else {
            this.jobInputs = JobHelper.getJobInputs(this);
        }

        this.sbgId = tool["sbg:id"];

        this.successCodes       = ensureArray(tool.successCodes);
        this.temporaryFailCodes = ensureArray(tool.temporaryFailCodes);
        this.permanentFailCodes = ensureArray(tool.permanentFailCodes);

        spreadSelectProps(tool, this.customProps, serializedKeys);
    }

    public serialize(): CommandLineTool {
        let base: CommandLineTool = <any> {};
        let hasShellQuote         = false;
        let hasExpression         = false;

        const shellWatcherDispose = this.eventHub.on("binding.shellQuote", (data) => {
            hasShellQuote = data;
        });

        const expressionWatcherDispose = this.eventHub.on("expression.serialize", (data) => {
            hasExpression = data;
        });

        base.class      = "CommandLineTool";
        base.cwlVersion = "v1.0";

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        base.baseCommand = this.baseCommand.filter(b => !!b);
        base.inputs      = <CommandInputParameter[]> this.inputs.map(i => i.serialize());
        base.outputs     = <CommandOutputParameter[]> this.outputs.map(o => o.serialize());

        if (this.description) base.doc = this.description;
        if (this.label) base.label = this.label;

        if (this.arguments.length) {
            base.arguments = this.arguments.map(a => a.serialize()).filter(a => !!a);
        }

        // Add ShellCommandRequirement if any CommandLineBinding has shellQuote
        // remove requirement if no CommandLineBinding has shellQuote
        const shellReqIndex = this.requirements.findIndex((req => req.class === "ShellCommandRequirement"));
        if (hasShellQuote) {
            base.requirements = [];
            if (shellReqIndex === -1) {
                base.requirements.push({
                    "class": "ShellCommandRequirement"
                });
            }
        } else if (shellReqIndex > -1) {
            this.requirements.splice(shellReqIndex, 1);
        }

        shellWatcherDispose();

        // REQUIREMENTS && HINTS
        base.requirements = base.requirements || [];
        base.hints        = [];


        if (this.requirements.length) {
            this.requirements.filter(r => !!r).forEach(r => base.requirements.push(r.serialize()));
        }

        if (this.hints.length) {
            this.hints.forEach(h => base.hints.push(h.serialize()));
        }

        if (this.resources.serialize()) {
            const dest = this.resources.isHint ? "hints" : "requirements";
            (base[dest] as Array<ProcessRequirement>).push(this.resources.serialize());
        }

        if (this.docker.serialize()) {
            const dest = this.docker.isHint ? "hints" : "requirements";
            (base[dest] as Array<ProcessRequirement>).push(this.docker.serialize());
        }

        if (this.fileRequirement.serialize()) {
            const dest = this.fileRequirement.isHint ? "hints" : "requirements";
            (base[dest] as Array<ProcessRequirement>).push(this.fileRequirement.serialize());
        }

        if (!base.requirements.length) delete base.requirements;
        if (!base.hints.length) delete base.hints;

        if (this.stdin.serialize() !== undefined) base.stdin = this.stdin.serialize();
        if (this.stdout.serialize() !== undefined) base.stdout = this.stdout.serialize();
        if (this.stderr.serialize() !== undefined) base.stderr = this.stderr.serialize();

        if (this.successCodes.length) {
            base.successCodes = this.successCodes;
        }

        if (this.temporaryFailCodes.length) {
            base.temporaryFailCodes = this.temporaryFailCodes;
        }

        if (this.permanentFailCodes.length) {
            base.permanentFailCodes = this.permanentFailCodes;
        }

        const exprReqIndex = this.requirements.findIndex((req => req.class === "InlineJavascriptRequirement"));
        if (hasExpression) {
            base.requirements = base.requirements || [];
            if (exprReqIndex === -1) {
                base.requirements.push({
                    "class": "InlineJavascriptRequirement"
                });
            }
        }
        expressionWatcherDispose();

        if (this.jobInputs) {
            base["sbg:job"] = {
                inputs: this.jobInputs,
                runtime: {}
            };

            if (this.runtime && this.runtime.cores !== undefined) {
                base["sbg:job"].runtime.cores = this.runtime.cores;
            }
            if (this.runtime && this.runtime.ram !== undefined) {
                base["sbg:job"].runtime.ram = this.runtime.ram;
            }
        }

        return spreadAllProps(base, this.customProps);
    }
}