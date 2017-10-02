export default JSON.parse(`
{
    "class": "Workflow",
    "cwlVersion": "v1.0",
    "id": "marijanlekic89/div-nesto-input/aa/0",
    "label": "workflow",
    "inputs": [
        {
            "id": "danglingInputPort1",
            "type": "int?",
            "sbg:x": -31.492602041630093,
            "sbg:y": -734.8507372482279
        },
        {
            "id": "inputPortString",
            "type": "string?",
            "sbg:x": -89.82754058298865,
            "sbg:y": 92.9772533718479
        },
        {
            "id": "inputPortFileTypesABC",
            "sbg:fileTypes": "A, b, c",
            "type": "File?",
            "sbg:x": -77.73537165835556,
            "sbg:y": 213.59375
        },
        {
            "id": "inputPortFileTypesA",
            "sbg:fileTypes": "a",
            "type": "File?",
            "sbg:x": -89.82754058298865,
            "sbg:y": 341.12005744222813
        },
        {
            "id": "inputPortFile",
            "type": "File?",
            "sbg:x": -88.10008787946963,
            "sbg:y": 434.097310814076
        },
        {
            "id": "inputPortArrayString",
            "type": "string[]?",
            "sbg:x": -122.64914194984988,
            "sbg:y": 546.0765439246331
        },
        {
            "id": "InputPortArrayFile",
            "type": "File[]?",
            "sbg:x": 0,
            "sbg:y": 640.78125
        },
        {
            "id": "danglingInputPort2",
            "type": "string?",
            "sbg:x": -23.881385803222656,
            "sbg:y": -562.614189954439
        },
        {
            "id": "inputPortToRemove",
            "type": "string?",
            "sbg:x": -31.736171067039912,
            "sbg:y": -358.03946050567833
        },
        {
            "id": "inputPortValidConnection",
            "type": "string?",
            "sbg:x": -45.49393211899936,
            "sbg:y": -183.2891896789633
        },
        {
            "id": "inputPortInvalidConnection",
            "type": "File?",
            "sbg:x": -28.28705794375029,
            "sbg:y": -31.896761570737688
        }
    ],
    "outputs": [
        {
            "id": "outputPortString",
            "outputSource": [
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputFile",
                "tool_step/stepOutputArrayString",
                "tool_step/stepOutputArrayFile"
            ],
            "type": "string?",
            "sbg:x": 565.9942328226766,
            "sbg:y": 106.79689025878906
        },
        {
            "id": "outputPortFileTypesDEF",
            "outputSource": [
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputFile",
                "tool_step/stepOutputArrayString",
                "tool_step/stepOutputArrayFile"
            ],
            "sbg:fileTypes": "d, e, f",
            "type": "File?",
            "sbg:x": 555.6295166015625,
            "sbg:y": 213.59376525878906
        },
        {
            "id": "outputPortFileTypesB",
            "outputSource": [
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputFile",
                "tool_step/stepOutputArrayString",
                "tool_step/stepOutputArrayFile"
            ],
            "sbg:fileTypes": "b",
            "type": "File?",
            "sbg:x": 555.6295166015625,
            "sbg:y": 320.390625
        },
        {
            "id": "outputPortFile",
            "outputSource": [
                "tool_step/stepOutputFile",
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputArrayString",
                "tool_step/stepOutputArrayFile"
            ],
            "type": "File?",
            "sbg:x": 555.6295166015625,
            "sbg:y": 427.1875
        },
        {
            "id": "outputPortArrayString",
            "outputSource": [
                "tool_step/stepOutputArrayString",
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputFile",
                "tool_step/stepOutputArrayFile"
            ],
            "type": "string[]?",
            "sbg:x": 555.6295166015625,
            "sbg:y": 533.984375
        },
        {
            "id": "outputPortArrayFile",
            "outputSource": [
                "tool_step/stepOutputArrayFile",
                "tool_step/stepOutputString",
                "tool_step/stepOutputFileTypesDEF",
                "tool_step/stepOutputFileTypesB",
                "tool_step/stepOutputFile",
                "tool_step/stepOutputArrayString"
            ],
            "type": "File[]?",
            "sbg:x": 555.6295166015625,
            "sbg:y": 640.78125
        },
        {
            "id": "outputPortToRemove",
            "outputSource": [
                "danglingInputPort1",
                "danglingInputPort2"
            ],
            "type": "map?",
            "sbg:x": 542.1075293251048,
            "sbg:y": -657.7889429840129
        },
        {
            "id": "danglingOutputPort1",
            "outputSource": [
                "inputPortToRemove"
            ],
            "type": "map?",
            "sbg:x": 541.6165161132812,
            "sbg:y": -500.71759288635667
        },
        {
            "id": "danglingOutputPort2",
            "outputSource": [
                "inputPortToRemove"
            ],
            "type": [
                "null",
                {
                    "type": "enum",
                    "symbols": [],
                    "name": "danglingOutputPort2"
                }
            ],
            "sbg:x": 543.3486207466177,
            "sbg:y": -345.17357064133
        },
        {
            "id": "outputPortValidConnection",
            "outputSource": [
                "inputPortValidConnection"
            ],
            "type": "string?",
            "sbg:x": 524.0868066123952,
            "sbg:y": -176.43594232635292
        },
        {
            "id": "outputPortInvalidConnection",
            "outputSource": [
                "inputPortInvalidConnection"
            ],
            "type": "File?",
            "sbg:x": 508.270392699419,
            "sbg:y": -35.13072204589844
        }
    ],
    "steps": [
        {
            "id": "tool_step",
            "in": [
                {
                    "id": "stepInputFile",
                    "source": [
                        "inputPortFile",
                        "inputPortString",
                        "inputPortFileTypesABC",
                        "inputPortFileTypesA",
                        "inputPortArrayString",
                        "InputPortArrayFile"
                    ]
                },
                {
                    "id": "stepInputString",
                    "source": [
                        "inputPortString",
                        "inputPortFileTypesABC",
                        "inputPortFileTypesA",
                        "inputPortFile",
                        "inputPortArrayString",
                        "InputPortArrayFile"
                    ]
                },
                {
                    "id": "stepInputArrayString",
                    "default": [],
                    "source": [
                        "inputPortArrayString",
                        "inputPortString",
                        "inputPortFileTypesABC",
                        "inputPortFileTypesA",
                        "inputPortFile",
                        "InputPortArrayFile"
                    ]
                },
                {
                    "id": "stepInputArrayFile",
                    "source": [
                        "InputPortArrayFile",
                        "inputPortString",
                        "inputPortFileTypesABC",
                        "inputPortFileTypesA",
                        "inputPortFile",
                        "inputPortArrayString"
                    ]
                },
                {
                    "id": "stepInputFileTypesABC",
                    "source": [
                        "inputPortFileTypesABC",
                        "inputPortString",
                        "inputPortFileTypesA",
                        "inputPortFile",
                        "inputPortArrayString",
                        "InputPortArrayFile"
                    ]
                },
                {
                    "id": "stepInputFileTypesA",
                    "source": [
                        "inputPortFileTypesA",
                        "inputPortString",
                        "inputPortFileTypesABC",
                        "inputPortFile",
                        "inputPortArrayString",
                        "InputPortArrayFile"
                    ]
                }
            ],
            "out": [
                {
                    "id": "stepOutputFile"
                },
                {
                    "id": "stepOutputString"
                },
                {
                    "id": "stepOutputArrayString"
                },
                {
                    "id": "stepOutputArrayFile"
                },
                {
                    "id": "stepOutputFileTypesDEF"
                },
                {
                    "id": "stepOutputFileTypesB"
                }
            ],
            "run": {
                "class": "CommandLineTool",
                "cwlVersion": "v1.0",
                "id": "tool_step",
                "baseCommand": [],
                "inputs": [
                    {
                        "id": "stepInputFile",
                        "type": "File?",
                        "inputBinding": {
                            "position": 0
                        }
                    },
                    {
                        "id": "stepInputString",
                        "type": "string?",
                        "inputBinding": {
                            "position": 0
                        }
                    },
                    {
                        "id": "stepInputArrayString",
                        "type": "string[]?",
                        "inputBinding": {
                            "position": 0
                        }
                    },
                    {
                        "id": "stepInputArrayFile",
                        "type": "File[]?",
                        "inputBinding": {
                            "position": 0
                        }
                    },
                    {
                        "id": "stepInputFileTypesABC",
                        "type": "File?",
                        "inputBinding": {
                            "position": 0
                        },
                        "sbg:fileTypes": "A, b, c"
                    },
                    {
                        "id": "stepInputFileTypesA",
                        "type": "File?",
                        "inputBinding": {
                            "position": 0
                        },
                        "sbg:fileTypes": "a"
                    }
                ],
                "outputs": [
                    {
                        "id": "stepOutputFile",
                        "type": "File?",
                        "outputBinding": {}
                    },
                    {
                        "id": "stepOutputString",
                        "type": "string?",
                        "outputBinding": {}
                    },
                    {
                        "id": "stepOutputArrayString",
                        "type": "string[]?",
                        "outputBinding": {}
                    },
                    {
                        "id": "stepOutputArrayFile",
                        "type": "File[]?",
                        "outputBinding": {}
                    },
                    {
                        "id": "stepOutputFileTypesDEF",
                        "type": "File?",
                        "outputBinding": {},
                        "sbg:fileTypes": "d, e, f"
                    },
                    {
                        "id": "stepOutputFileTypesB",
                        "type": "File?",
                        "outputBinding": {},
                        "sbg:fileTypes": "b"
                    }
                ],
                "label": "tool-step",
                "sbg:job": {
                    "inputs": {
                        "stepInputFile": {
                            "class": "File",
                            "nameext": ".ext",
                            "secondaryFiles": [],
                            "nameroot": "input",
                            "path": "/path/to/input.ext",
                            "size": 0,
                            "contents": "file contents",
                            "basename": "input.ext"
                        },
                        "stepInputString": "input-string-value",
                        "stepInputArrayString": [
                            "stepInputArrayString-string-value-1",
                            "stepInputArrayString-string-value-2"
                        ],
                        "stepInputArrayFile": [
                            {
                                "class": "File",
                                "contents": "file contents",
                                "size": 0,
                                "path": "/path/to/stepInputArrayFile-1.ext",
                                "secondaryFiles": []
                            },
                            {
                                "class": "File",
                                "contents": "file contents",
                                "size": 0,
                                "path": "/path/to/stepInputArrayFile-2.ext",
                                "secondaryFiles": []
                            }
                        ],
                        "stepInputFileTypesABC": null,
                        "stepInputFileTypesA": null,
                        "InputArrayFileTypesABC": {
                            "class": "File",
                            "nameext": ".ext",
                            "secondaryFiles": [],
                            "nameroot": "input",
                            "path": "/path/to/input.ext",
                            "size": 0,
                            "contents": "file contents",
                            "basename": "input.ext"
                        },
                        "InputArrayFileTypesA": {
                            "class": "File",
                            "nameext": ".ext",
                            "secondaryFiles": [],
                            "nameroot": "input",
                            "path": "/path/to/input.ext",
                            "size": 0,
                            "contents": "file contents",
                            "basename": "input.ext"
                        }
                    },
                    "runtime": {
                        "cores": 1,
                        "ram": 1000
                    }
                }
            },
            "label": "tool-step",
            "sbg:x": 271.50094901351656,
            "sbg:y": 345.58698447561255
        }
    ],
    "sbg:sbgMaintained": false,
    "sbg:contributors": [
        "marijanlekic89"
    ],
    "sbg:validationErrors": [],
    "sbg:id": "marijanlekic89/div-nesto-input/aa/0",
    "sbg:publisher": "sbg",
    "sbg:projectName": "<div>Nesto <input>",
    "sbg:image_url": null,
    "sbg:createdOn": 1505915392,
    "sbg:appVersion": [
        "v1.0"
    ],
    "sbg:createdBy": "marijanlekic89",
    "sbg:project": "marijanlekic89/div-nesto-input",
    "sbg:modifiedOn": 1505915392,
    "sbg:modifiedBy": "marijanlekic89",
    "sbg:latestRevision": 0,
    "sbg:revisionsInfo": [
        {
            "sbg:modifiedBy": "marijanlekic89",
            "sbg:revision": 0,
            "sbg:modifiedOn": 1505915392,
            "sbg:revisionNotes": null
        }
    ],
    "sbg:revision": 0
}
`);
