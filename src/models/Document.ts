const YAML = require("js-yaml");

export class Document {

    static load(doc: string): Document {
        YAML.safeLoad(doc, {listener: (action: string, state: Object)=>{
            let stateClone = Object.assign({},state);
            delete stateClone['schema'];
            delete stateClone['onWarning'];
            delete stateClone['listener'];
            delete stateClone['implicitTypes'];
            delete stateClone['typeMap'];
            console.log(action, stateClone)}
        });
        return new Document();
    }

}