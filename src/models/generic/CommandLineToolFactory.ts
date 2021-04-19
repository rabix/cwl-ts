import {Process} from "../../mappings/v1.0/Process";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {CommandLineTool as SBDraft2CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandLineTool as V1CommandLineTool} from "../../mappings/v1.0/CommandLineTool";
import {V1_1CommandLineToolModel} from "../v1.1/V1_1CommandLineToolModel";
import {V1CommandLineToolModel} from "../v1.0/V1CommandLineToolModel";
import {SBDraft2CommandLineToolModel} from "../d2sb/SBDraft2CommandLineToolModel";
import {V1_2CommandLineToolModel} from "../v1.2/V1_2CommandLineToolModel";


export class CommandLineToolFactory {
    public static from(tool?: V1CommandLineTool | SBDraft2CommandLineTool | Process, loc?: string): CommandLineToolModel {
        // check if tool passed has already been parsed to the model
        if (tool instanceof CommandLineToolModel) return tool;

        if (tool) {
            switch (tool.cwlVersion) {
                case "v1.2":
                    return new V1_2CommandLineToolModel(tool as V1CommandLineTool, loc);
                case "v1.1":
                    return new V1_1CommandLineToolModel(tool as V1CommandLineTool, loc);
                case "v1.0":
                    return new V1CommandLineToolModel(tool as V1CommandLineTool, loc);
                case "sbg:draft-2":
                case "draft-2":
                default:
                    return new SBDraft2CommandLineToolModel(tool as SBDraft2CommandLineTool, loc);
                // default:
                //     //@todo should default to draft-2 because that was the last draft that didn't require cwlVersion
                //     console.warn("Unsupported CWL version", tool.cwlVersion);
            }
        }

        return new SBDraft2CommandLineToolModel(tool as SBDraft2CommandLineTool, loc);
    }
}
