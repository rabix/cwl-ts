export default JSON.parse(`
{
  "successCodes": [],
  "sbg:toolkitVersion": "2.4.0",
  "requirements": [
    {
      "class": "ExpressionEngineRequirement",
      "requirements": [
        {
          "class": "DockerRequirement",
          "dockerPull": "rabix/js-engine"
        }
      ],
      "id": "#cwl-js-engine"
    }
  ],
  "sbg:image_url": null,
  "arguments": [
    {
      "position": 0,
      "valueFrom": {
        "class": "Expression",
        "engine": "#cwl-js-engine",
        "script": "{\\n  if (!$job.inputs.input_bai_file){\\n    return \\"-in \\" + $job.inputs.input_bam_file.path.split('/').pop() \\n  }\\n}"
      },
      "separate": true
    },
    {
      "position": 1,
      "valueFrom": {
        "class": "Expression",
        "engine": "#cwl-js-engine",
        "script": "{\\n  if (!$job.inputs.input_bai_file)\\n    if ((typeof $job.inputs.bti_format !== \\"undefined\\") && ($job.inputs.bti_format))\\n    \\treturn \\"-bti\\"  \\n}"
      },
      "separate": true
    }
  ],
  "sbg:categories": [
    "SAM/BAM-Processing",
    "Indexing"
  ],
  "sbg:modifiedOn": 1466179976,
  "sbg:cmdPreview": "/opt/bamtools/bin/bamtools index  -in input_bam.bam",
  "sbg:createdBy": "admin",
  "sbg:validationErrors": [],
  "sbg:latestRevision": 27,
  "hints": [
    {
      "class": "DockerRequirement",
      "dockerPull": "images.sbgenomics.com/markop/bamtools:2.4.0",
      "dockerImageId": "f808163d4cd3"
    },
    {
      "value": 1,
      "class": "sbg:CPURequirement"
    },
    {
      "value": 1000,
      "class": "sbg:MemRequirement"
    }
  ],
  "stdout": "",
  "sbg:links": [
    {
      "id": "https://github.com/pezmaster31/bamtools",
      "label": "Homepage"
    },
    {
      "id": "https://github.com/pezmaster31/bamtools/wiki",
      "label": "Wiki"
    }
  ],
  "sbg:job": {
    "allocatedResources": {
      "cpu": 1,
      "mem": 1000
    },
    "inputs": {
      "input_bam_file": {
        "class": "File",
        "secondaryFiles": [],
        "path": "input/input_bam.bam",
        "size": 0
      },
      "bti_format": false
    }
  },
  "inputs": [
    {
      "sbg:stageInput": "link",
      "sbg:fileTypes": "BAM",
      "label": "Input BAM file",
      "description": "The input BAM file.",
      "type": [
        "File"
      ],
      "sbg:category": "Input & Output",
      "id": "#input_bam_file"
    },
    {
      "description": "Create (non-standard) BamTools index file (*.BTI). Default behavior is to create standard BAM index (*.BAI).",
      "sbg:category": "Input & Output",
      "type": [
        "null",
        "boolean"
      ],
      "id": "#bti_format",
      "label": "BTI format"
    },
    {
      "sbg:stageInput": "link",
      "sbg:fileTypes": "BAI",
      "label": "Input BAI(BAM index) file",
      "description": "Input BAI(BAM index) file.",
      "type": [
        "null",
        "File"
      ],
      "id": "#input_bai_file"
    }
  ],
  "sbg:license": "The MIT License",
  "sbg:modifiedBy": "admin",
  "sbg:contributors": [
    "admin"
  ],
  "sbg:id": "admin/sbg-public-data/bamtools-index-2-4-0/27",
  "sbg:toolAuthor": "Derek Barnett, Erik Garrison, Gabor Marth, and Michael Stromberg",
  "label": "BamTools Index",
  "outputs": [
    {
      "sbg:fileTypes": "BAM",
      "outputBinding": {
        "secondaryFiles": [
          ".bai",
          ".bti"
        ],
        "sbg:inheritMetadataFrom": "#input_bam_file",
        "glob": {
          "class": "Expression",
          "engine": "#cwl-js-engine",
          "script": "$job.inputs.input_bam_file.path.split(\\"/\\").pop()"
        }
      },
      "description": "Output BAM file with index (BAI or BTI) file.",
      "label": "Output BAM file",
      "type": [
        "File"
      ],
      "id": "#output_bam_file"
    }
  ],
  "description": "BamTools Index creates an index file (BAI or BTI) for a BAM file. If BAI file is present on the input the tool will skip indexing step and output BAM with provided BAI file.",
  "sbg:createdOn": 1456304889,
  "sbg:revision": 27,
  "id": "https://staging-api.sbgenomics.com/v2/apps/admin/sbg-public-data/bamtools-index-2-4-0/27/raw/",
  "class": "CommandLineTool",
  "stdin": "",
  "sbg:homepage": "https://github.com/pezmaster31/bamtools/wiki",
  "sbg:revisionsInfo": [
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 0,
      "sbg:modifiedOn": 1456304889
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 1,
      "sbg:modifiedOn": 1456304889
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 2,
      "sbg:modifiedOn": 1456304889
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 3,
      "sbg:modifiedOn": 1456304889
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 4,
      "sbg:modifiedOn": 1456304889
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 5,
      "sbg:modifiedOn": 1457526806
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 6,
      "sbg:modifiedOn": 1459788635
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 7,
      "sbg:modifiedOn": 1462442921
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 8,
      "sbg:modifiedOn": 1462442921
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 9,
      "sbg:modifiedOn": 1462442921
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 10,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 11,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 12,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 13,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 14,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 15,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 16,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 17,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 18,
      "sbg:modifiedOn": 1466179929
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 19,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 20,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 21,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 22,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 23,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 24,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 25,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 26,
      "sbg:modifiedOn": 1466179976
    },
    {
      "sbg:modifiedBy": "admin",
      "sbg:revisionNotes": null,
      "sbg:revision": 27,
      "sbg:modifiedOn": 1466179976
    }
  ],
  "sbg:project": "admin/sbg-public-data",
  "baseCommand": [
    {
      "class": "Expression",
      "engine": "#cwl-js-engine",
      "script": "{\\n  if ($job.inputs.input_bai_file){\\n \\treturn\\"echo Skipping index step because BAI file is provided on the input.\\"\\n  }\\n  else{\\n    return \\"/opt/bamtools/bin/bamtools index\\"\\n  }\\n}"
    }
  ],
  "sbg:sbgMaintained": false,
  "sbg:toolkit": "BamTools",
  "temporaryFailCodes": []
}
`);