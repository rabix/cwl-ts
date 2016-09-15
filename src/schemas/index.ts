/**
 * Created by majanedeljkovic on 9/6/16.
 */
declare function require(s: string);

//noinspection TypeScriptUnresolvedVariable
export = {
    schemas: {
        draft4: {
            cltSchema: require('./draft-4/CLT-schema.json'),
            wfSchema: require('./draft-4/WF-schema.json'),
            etSchema: require('./draft-4/ET-schema.json')
        },
        draft3: {
            cltSchema: require('./draft-3/CLT-schema.json'),
            wfSchema: require('./draft-3/WF-schema.json'),
            etSchema: require('./draft-3/ET-schema.json')
        },
        d2sb: {
            cltSchema: require('./d2sb/CLT-schema.json'),
            wfSchema: require('./d2sb/WF-schema.json'),
            etSchema: require('./d2sb/ET-schema.json')
        }
    }
};