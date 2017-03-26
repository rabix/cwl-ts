import {UnimplementedMethodException} from "../helpers/UnimplementedMethodException";
import {Serializable} from "../interfaces/Serializable";
import {DirentModel} from "./DirentModel";
import {ProcessRequirementModel} from "./ProcessRequirementModel";

export abstract class CreateFileRequirementModel extends ProcessRequirementModel implements Serializable<any> {
    class: string;
    listing: DirentModel[];

    public addDirent(def?: any): DirentModel {
        new UnimplementedMethodException("addDirent", "CreateFileRequirementModel");
        return null;
    }


}