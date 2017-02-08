import {Process} from "../../mappings/v1.0/Process";
import {CommandLineToolModel} from "./CommandLineToolModel";
import {CommandLineTool as SBDraft2CommandLineTool} from "../../mappings/d2sb/CommandLineTool";
import {CommandLineTool as V1CommandLineTool} from "../../mappings/v1.0/CommandLineTool";
import {V1CommandLineToolModel} from "../v1.0/V1CommandLineToolModel";
import {SBDraft2CommandLineToolModel} from "../d2sb/SBDraft2CommandLineToolModel";


export class CommandLineToolFactory {
    public static from(tool?: V1CommandLineTool | SBDraft2CommandLineTool | Process, loc?: string): CommandLineToolModel {
        if (tool) {
            switch (tool.cwlVersion) {
                case "v1.0":
                    return new V1CommandLineToolModel(tool as V1CommandLineTool, loc);
                case "sbg:draft-2":
                case "draft-2":
                default:
                    return new SBDraft2CommandLineToolModel(loc, tool as SBDraft2CommandLineTool);
                // default:
                //     //@todo should default to draft-2 because that was the last draft that didn't require cwlVersion
                //     console.warn("Unsupported CWL version", workflow.cwlVersion);
            }
        }

        return new SBDraft2CommandLineToolModel(loc, tool as SBDraft2CommandLineTool);
    }
}