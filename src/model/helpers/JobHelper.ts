import {CommandInputParameterModel} from "../v1/CommandInputParameterModel";
import {CommandLineToolModel} from "../v1/CommandLineToolModel";

export class JobHelper {

    private static getJobPart(input: CommandInputParameterModel, symbols?) {
        let type = <any> input.type;
        let name: string = input.id;


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
            record: {fields: {}},
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
                record: [{fields: {}}],
                map: [{}],
                'enum': [symbols ? symbols[0] : name]
            }
        };

        return map[type];
    }

    public static getJob(tool: CommandLineToolModel): any {
        let job = {};

        tool.inputs.forEach(input => {
            job[input.id] = JobHelper.getJobPart(input);
        });

        return job;
    }
}

