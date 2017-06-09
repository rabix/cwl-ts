import {CommandInputParameterModel} from "../generic/CommandInputParameterModel";
import {CommandLineToolModel} from "../generic/CommandLineToolModel";

export class JobHelper {

    public static generateMockJobData(input: CommandInputParameterModel) {
        const type = <any> input.type.type;
        const items = <any> input.type.items;
        const name: string = input.id;
        const symbols: string[] = input.type.symbols;

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

        let map = {
            file: {path: '/path/to/' + name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
            File: {path: '/path/to/' + name + '.ext', 'class': 'File', size: 0, secondaryFiles: []},
            'enum': symbols ? symbols[0] : name,
            string: name + '-string-value',
            int: getRandomInt(0,11),
            float: getRandomFloat(0, 11),
            boolean: true,
            record: {},
            map: {},
            array: {
                file: [
                    {path: '/path/to/' + name + '-1.ext', 'class': 'File', size: 0, secondaryFiles: []},
                    {path: '/path/to/' + name + '-2.ext', 'class': 'File', size: 0, secondaryFiles: []}
                ],
                File: [
                    {path: '/path/to/' + name + '-1.ext', 'class': 'File', size: 0, secondaryFiles: []},
                    {path: '/path/to/' + name + '-2.ext', 'class': 'File', size: 0, secondaryFiles: []}
                ],
                string: [name+'-string-value-1', name+'-string-value-2'],
                int: [getRandomInt(0,11), getRandomInt(0,11)],
                float: [getRandomFloat(0, 11), getRandomFloat(0, 11)],
                record: [{}],
                map: [{}],
                'enum': [symbols ? symbols[0] : name]
            }
        };

        let val = map[type];

        if (type === "array") {
            val = val[items];

            if (items === "record" && input.type.fields) {
                val = [];
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

        return val !== undefined ? val : null;
    }

    public static getJobInputs(tool: CommandLineToolModel): any {
        let job = {};

        tool.inputs.forEach(input => {
            job[input.id] = JobHelper.generateMockJobData(input);
        });

        return job;
    }

    public static getNullJobInputs(tool: CommandLineToolModel): any {
        let job = {};

        tool.inputs.forEach(input => {
           job[input.id] = JobHelper.nullifyInput(input);
        });

        return job;
    }

    private static nullifyInput(input: CommandInputParameterModel) {
        return input.type.type === "array" ? [] : null;
    }
}

