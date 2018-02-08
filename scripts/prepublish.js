#!/usr/bin/env node
const fs = require("fs-extra");

const distDir = __dirname + "/../dist";
const srcDir = __dirname + "/../src";

const clean = new Promise((resolve, reject) => {
    fs.access(distDir, fs.F_OK, accessError => {
        if (accessError) return resolve();

        fs.remove(distDir, removeError => {
            if (removeError) return reject(removeError);
            resolve();
        });
    });
});

const schemaSource = `${srcDir}/schemas`;
const schemaDist = `${distDir}/schemas`;

clean.then(() => Promise.all([
    fs.copy(`${schemaSource}/d2sb`, `${schemaDist}/d2sb`),
    fs.copy(`${schemaSource}/draft-3`, `${schemaDist}/draft-3`),
    fs.copy(`${schemaSource}/cwl-v10.json`, `${schemaDist}/cwl-v10.json`),
    fs.copy(`${schemaSource}/cwl-mixed.json`, `${schemaDist}/cwl-mixed.json`),
    fs.copy(`${srcDir}/../package.json`, `${distDir}/package.json`),
    fs.copy(`${srcDir}/../package-lock.json`, `${distDir}/package-lock.json`),
])).catch(err => {
    process.exit(1);
});
