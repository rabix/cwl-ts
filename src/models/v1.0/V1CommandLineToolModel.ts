import {CommandLineTool, Expression, ProcessRequirement} from "../../mappings/v1.0/";
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
    ensureArray, incrementLastLoc, snakeCase, spreadAllProps,
    spreadSelectProps
} from "../helpers/utils";
import {V1CommandArgumentModel} from "./V1CommandArgumentModel";
import {V1CommandInputParameterModel} from "./V1CommandInputParameterModel";
import {V1CommandOutputParameterModel} from "./V1CommandOutputParameterModel";
import {V1ExpressionModel} from "./V1ExpressionModel";
import {V1InitialWorkDirRequirementModel} from "./V1InitialWorkDirRequirementModel";
import {V1ResourceRequirementModel} from "./V1ResourceRequirementModel";

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

    public getContext(id?: string): any {
        const context: any = {
            runtime: this.runtime,
            inputs: this.jobInputs
        };

        if (id) {
            context.self = this.jobInputs[id];
        }

        // console.log("sending context", context.inputs);

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
        const loc = incrementLastLoc(this.outputs, `${this.loc}.outputs`);

        const o = new V1CommandOutputParameterModel(output, loc);

        o.setValidationCallback(err => this.updateValidity(err));

        if (!o.id) {
            o.updateValidity({
                [o.loc + ".id"]: {
                    type: "info",
                    message: `Output had no id, setting id to "${this.getNextAvailableId("output")}"`
                }
            });
        }

        o.id = o.id || this.getNextAvailableId("output");

        try {
            this.checkIdValidity(o.id)
        } catch (ex) {
            this.updateValidity({
                [o.loc + ".id"]: {
                    type: "error",
                    message: ex.message
                }
            });
        }

        this.outputs.push(o);
        return o;
    }

    public addInput(input?): V1CommandInputParameterModel {
        const loc = incrementLastLoc(this.inputs, `${this.loc}.inputs`);

        const i = new V1CommandInputParameterModel(input, loc, this.eventHub);

        i.setValidationCallback(err => this.updateValidity(err));

        if (!i.id) {
            i.updateValidity({
                [i.loc + ".id"]: {
                    type: "info",
                    message: `Input had no id, setting id to "${this.getNextAvailableId("input")}"`
                }
            });
        }

        i.id = i.id || this.getNextAvailableId("input");

        try {
            this.checkIdValidity(i.id)
        } catch (ex) {
            this.updateValidity({
                [i.loc + ".id"]: {
                    type: "error",
                    message: ex.message
                }
            });
        }

        this.inputs.push(i);
        this.eventHub.emit("input.create", i);

        return i;
    }

    public addArgument(arg?: CommandLineBinding | string): V1CommandArgumentModel {
        const loc = incrementLastLoc(this.arguments, `${this.loc}.arguments`);

        const a = new V1CommandArgumentModel(arg, loc);
        this.arguments.push(a);

        a.setValidationCallback(err => this.updateValidity(err));
        this.eventHub.emit("argument.create", arg);
        return a;
    }

    public addBaseCommand(cmd?: Expression | string): V1ExpressionModel {
        const loc = incrementLastLoc(this.baseCommand, `${this.loc}.baseCommand`);

        const b = new V1ExpressionModel(cmd, loc);
        this.baseCommand.push(b);

        b.setValidationCallback(err => this.updateValidity(err));
        return b;
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
                    <InitialWorkDirRequirement> req, loc);
                this.fileRequirement.setValidationCallback(err => this.updateValidity(err));
                this.fileRequirement.isHint = hint;
                return;

            case "ResourceRequirement":
                loc            = this.resources ? this.resources.loc || loc : loc;
                this.resources = new V1ResourceRequirementModel(req, loc);
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
        const map = {};

        const promises: Promise<any>[] = [];

        // validate inputs and make sure IDs are unique
        for (let i = 0; i < this.inputs.length; i++) {
            const input = this.inputs[i];
            promises.push(input.validate(this.getContext(input.id)));

            if (!map[input.id]) {
                map[input.id] = true
            } else {
                input.updateValidity({
                    [`${input.loc}.id`]: {
                        type: "error",
                        message: `Duplicate id "${input.id}"`
                    }
                });
            }
        }

        // validate outputs and make sure IDs are unique
        for (let i = 0; i < this.outputs.length; i++) {
            const output = this.outputs[i];
            promises.push(output.validate(this.getContext()));

            if (!map[output.id]) {
                map[output.id] = true
            } else {
                output.updateValidity({
                    [`${output.loc}.id`]: {
                        type: "error",
                        message: `Duplicate id "${output.id}"`
                    }
                });
            }
        }

        for(let i = 0; i < this.arguments.length; i++) {
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

        ensureArray(tool.inputs, "id", "type").map(inp => this.addInput(inp));
        ensureArray(tool.outputs, "id", "type").map(out => this.addOutput(out));
        ensureArray(tool.baseCommand).map(cmd => this.addBaseCommand(cmd));

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
            this.fileRequirement = new V1InitialWorkDirRequirementModel(<InitialWorkDirRequirement> {}, `${this.loc}.requirements[${++counter}]`);
        }
        this.fileRequirement.setValidationCallback(err => this.updateValidity(err));

        // create ResourceRequirement for manipulation
        if (!this.resources) {
            this.resources = new V1ResourceRequirementModel(<ResourceRequirement> {}, `${this.loc}.requirements[${++counter}]`);
        }
        this.resources.setValidationCallback(err => this.updateValidity(err));

        this.arguments = ensureArray(tool.arguments).map(arg => this.addArgument(arg));

        this.stdin = new V1ExpressionModel(tool.stdin, `${this.loc}.stdin`);
        this.stdin.setValidationCallback(err => this.updateValidity(err));

        this.stdout = new V1ExpressionModel(tool.stdout, `${this.loc}.stdout`);
        this.stdout.setValidationCallback(err => this.updateValidity(err));

        this.stderr = new V1ExpressionModel(tool.stderr, `${this.loc}.stderr`);
        this.stderr.setValidationCallback(err => this.updateValidity(err));

        this.runtime = {cores: 1, ram: 1000};

        if (tool["sbg:job"]) {
            this.jobInputs = {...JobHelper.getNullJobInputs(this), ...tool["sbg:job"].inputs};
            this.runtime   = {...this.runtime, ...tool["sbg:job"].runtime};
        } else {
            this.jobInputs = JobHelper.getJobInputs(this);
        }

        this.sbgId = tool["sbg:id"];

        // this.successCodes       = ensureArray(tool.successCodes);
        // this.temporaryFailCodes = ensureArray(tool.temporaryFailCodes);
        // this.permanentFailCodes = ensureArray(tool.permanentFailCodes);

        spreadSelectProps(tool, this.customProps, serializedKeys);
    }

    public serialize() {
        let base: CommandLineTool = {
            "class": "CommandLineTool",
            cwlVersion: "v1.0",
            baseCommand: this.baseCommand.map(b => b.serialize()).filter(b => !!b),
            inputs: <CommandInputParameter[]> this.inputs.map(i => i.serialize()),
            outputs: <CommandOutputParameter[]> this.outputs.map(o => o.serialize())
        };

        if (this.sbgId || this.id) {
            base.id = this.sbgId || this.id;
        }

        // REQUIREMENTS && HINTS
        base.requirements = [];
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

        if (this.arguments.length) base.arguments = this.arguments.map(a => a.serialize());

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