import { ResourceRequirement } from '../../mappings/v1.0/ResourceRequirement';
import { ProcessRequirementModel } from '../generic';

export class V1ResourceRequirementModel extends ProcessRequirementModel{


    constructor(loc: string) {
       super(loc);
    }

    serialize(): ResourceRequirement {
        return {
            "class": "ResourceRequirement"
        };
    }

    deserialize(attr: ResourceRequirement): void {
        
    }
}
