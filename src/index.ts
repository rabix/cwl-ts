import {CommandLineToolModel} from "./model/draft-4/CommandLineToolModel";

declare function require(name:string);

export let draft4 = {
    cltSchema: require('./parser/schemas/draft-4/CLT-schema.json'),
    wfSchema: require('./parser/schemas/draft-4/WF-schema.json'),
    etSchema: require('./parser/schemas/draft-4/ET-schema.json'),
    model: {
        CommandLineToolModel: CommandLineToolModel
    }
};

export let draft3 = {
    cltSchema: require('./parser/schemas/draft-3/CLT-schema.json'),
    wfSchema: require('./parser/schemas/draft-3/WF-schema.json'),
    etSchema: require('./parser/schemas/draft-3/ET-schema.json')
};