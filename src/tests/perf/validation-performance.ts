import {WorkflowFactory} from "../../models/generic/WorkflowFactory";
import * as fs from "fs";
import {Workflow} from "../../mappings/v1.0/Workflow";


fs.readFile(__dirname + "somatic.json", "utf-8", (err, file) => {
    if (err) {
        console.log("Couldn't load");
        return;
    }

    try {
        console.time("BCBio");
        WorkflowFactory.from(JSON.parse(file) as Workflow);
        console.timeEnd("BCBio");

    } catch (ex) {
        console.log("Couldn't parse");
    }
});