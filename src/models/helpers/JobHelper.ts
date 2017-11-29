import {InputParameterModel} from "../generic/InputParameterModel";
import {V1CommandInputParameterModel} from "../v1.0/V1CommandInputParameterModel";
import {V1WorkflowInputParameterModel} from "../v1.0/V1WorkflowInputParameterModel";

export class JobHelper {

    public static generateMockJobData(input: InputParameterModel) {
        const type              = <any> input.type.type;
        const items             = <any> input.type.items;
        const name: string      = input.id;
        const symbols: string[] = input.type.symbols;

        const version = input instanceof V1CommandInputParameterModel || input instanceof V1WorkflowInputParameterModel ? "v1.0" : "sbg:draft-2";

        /**
         * Returns a random integer between min (included) and max (excluded)
         *
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        /**
         * Returns a random floating number between min (inclusive) and max (exclusive)
         *
         * @param {number} min
         * @param {number} max
         * @returns {float}
         */
        function getRandomFloat(min, max) {
            return Math.random() * (max - min) + min;
        }

        const file = (name) => {
            return {
                path: '/path/to/' + name + '.ext',
                    'class': 'File',
                size: 0,
                contents: "file contents",
                secondaryFiles: [],
                metadata: {}
            }
        };

        let map = {
            File: file(name),
            Directory: {path: "/path/to/" + name, "class": "Directory", basename: name},
            'enum': symbols ? symbols[0] : name,
            string: name + '-string-value',
            int: getRandomInt(0, 11),
            float: getRandomFloat(0, 11),
            boolean: true,
            record: {},
            map: {},
            array: {
                File: [
                    file(name + "-1"),
                    file(name + "-2")
                ],
                Directory: [
                    {
                        path: "/path/to/" + name,
                        "class": "Directory",
                        basename: name
                    },
                    {
                        path: "/path/to/" + name,
                        "class": "Directory",
                        basename: name
                    }
                ],
                string: [name + '-string-value-1', name + '-string-value-2'],
                int: [getRandomInt(0, 11), getRandomInt(0, 11)],
                float: [getRandomFloat(0, 11), getRandomFloat(0, 11)],
                record: [{}],
                map: [{}],
                'enum': [symbols ? symbols[0] || "" : name || ""],
                boolean: [true, true],
            }
        };

        let val = map[type];

        if (type === "array") {
            val = val[items];

            if (items === "record" && input.type.fields) {
                val       = [];
                const obj = {};

                input.type.fields.forEach(field => {
                    obj[field.id] = JobHelper.generateMockJobData(field);
                });

                // Objects must be cloned because of job management and later manipulation
                const obj1 = JSON.parse(JSON.stringify(obj));
                const obj2 = JSON.parse(JSON.stringify(obj));
                val.push(obj1);
                val.push(obj2);
            }
        }
        if (type === "record" && input.type.fields) {
            input.type.fields.forEach(field => {
                val[field.id] = JobHelper.generateMockJobData(field);
            });
        }

        if (type === "File" && version === "v1.0") {
            val = {...val, ...{basename: name + ".ext", nameroot: name, nameext: ".ext"}};
        }

        return val !== undefined ? val : null;
    }

    public static getJobInputs(app: {inputs: InputParameterModel[]} ): any {
        let job = {};


        app.inputs.forEach((input: InputParameterModel) => {
            job[input.id] = JobHelper.generateMockJobData(input);
        });

        return job;
    }

    public static getNullJobInputs(app: {inputs: InputParameterModel[]}): any {
        let job = {};

        app.inputs.forEach(input => {
            job[input.id] = JobHelper.nullifyInput(input);
        });

        return job;
    }

    private static nullifyInput(input: InputParameterModel) {
        return input.type.type === "array" ? [] : null;
    }
}

