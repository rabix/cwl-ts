export default JSON.parse(`{
  "class": "CommandLineTool",
  "inputs": [
    {
      "type": [
        "File"
      ],
      "inputBinding": {
        "separate": true,
        "secondaryFiles": [
          ".tbi"
        ],
        "position": 40
      },
      "id": "#input_file"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-i",
        "position": 13
      },
      "id": "#include_expression"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-e",
        "position": 10
      },
      "id": "#exclude_expression"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-m",
        "position": 14
      },
      "id": "#mark_sites"
    },
    {
      "id": "#output_name",
      "type": [
        "null",
        "string"
      ]
    },
    {
      "type": [
        "null",
        {
          "type": "enum",
          "name": "output_type",
          "symbols": [
            "CompressedBCF",
            "UncompressedBCF",
            "compressedVCF",
            "UncompressedVCF"
          ]
        }
      ],
      "inputBinding": {
        "separate": false,
        "valueFrom": {
          "script": "{  if($job.inputs.output_type === 'CompressedBCF') return 'b'  if($job.inputs.output_type === 'UncompressedBCF') return 'u'  if($job.inputs.output_type === 'CompressedVCF') return 'z'  if($job.inputs.output_type === 'UncompressedVCF') return 'v'}",
          "class": "Expression",
          "engine": "#cwl-js-engine"
        },
        "prefix": "-O",
        "position": 16
      },
      "id": "#output_type"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-r",
        "position": 17
      },
      "id": "#regions"
    },
    {
      "type": [
        "null",
        "File"
      ],
      "inputBinding": {
        "separate": true,
        "loadContents": false,
        "prefix": "-R",
        "position": 18
      },
      "id": "#regions_from_file"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-s",
        "position": 20
      },
      "id": "#samples"
    },
    {
      "type": [
        "null",
        "File"
      ],
      "inputBinding": {
        "separate": true,
        "sbg:cmdInclude": true,
        "prefix": "-S",
        "position": 22
      },
      "id": "#samples_file"
    },
    {
      "type": [
        "null",
        "int"
      ],
      "id": "#threads"
    },
    {
      "type": [
        "null",
        "File"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-a",
        "secondaryFiles": [
          ".tbi"
        ],
        "position": 4
      },
      "id": "#annotations"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-c",
        "position": 5
      },
      "id": "#columns"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-h",
        "position": 11
      },
      "id": "#header_lines"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "-I",
        "position": 12
      },
      "id": "#set_id"
    },
    {
      "type": [
        "null",
        "File"
      ],
      "inputBinding": {
        "separate": true,
        "prefix": "--rename-chrs",
        "position": 19
      },
      "id": "#rename_chrs"
    },
    {
      "type": [
        "null",
        "string"
      ],
      "inputBinding": {
        "separate": true,
        "sbg:cmdInclude": true,
        "prefix": "-x",
        "position": 23
      },
      "id": "#remove_annotations"
    }
  ],
  "outputs": [
    {
      "type": [
        "null",
        "File"
      ],
      "outputBinding": {
        "glob": {
          "script": "{  if($job.inputs.output_name){    return $job.inputs.output_name  }  else return 'annotated_' + $job.inputs.input_file.path.split('/')[$job.inputs.input_file.path.split('/').length-1]    }",
          "class": "Expression",
          "engine": "#cwl-js-engine"
        },
        "sbg:inheritMetadataFrom": "#input_file"
      },
      "id": "#output_file"
    }
  ],
  "baseCommand": [
    "bcftools",
    "annotate",
    "",
    ""
  ],
  "stdin": "",
  "stdout": "",
  "successCodes": [
    0
  ],
  "temporaryFailCodes": [
    1
  ],
  "arguments": [
    {
      "separate": true,
      "valueFrom": {
        "script": "{  if($job.inputs.output_name){    return $job.inputs.output_name  }  else return 'annotated_' + $job.inputs.input_file.path.split('/')[$job.inputs.input_file.path.split('/').length-1]    }",
        "class": "Expression",
        "engine": "#cwl-js-engine"
      },
      "prefix": "-o",
      "position": 3
    }
  ],
  "sbg:job": {
    "inputs": {
      "exclude_expression": "",
      "annotations": {
        "path": "/path/to/annotations.ext",
        "class": "File",
        "size": 0,
        "secondaryFiles": [
          {
            "path": ".tbi"
          }
        ]
      },
      "mark_sites": null,
      "header_lines": null,
      "remove_annotations": null,
      "include_expression": "'REF=C'",
      "columns": null,
      "rename_chrs": {
        "path": null,
        "class": "File",
        "size": 0,
        "secondaryFiles": []
      },
      "samples": "",
      "input_file": {
        "path": "/path/to/input_file.ext.vcf.gz",
        "class": "File",
        "size": 0,
        "secondaryFiles": [
          {
            "path": ".tbi"
          }
        ]
      },
      "output_type": "CompressedBCF",
      "regions": "",
      "samples_file": {
        "path": null,
        "class": "File",
        "size": 0,
        "secondaryFiles": []
      },
      "regions_from_file": {
        "path": null,
        "class": "File",
        "size": 0,
        "secondaryFiles": []
      },
      "output_name": "",
      "threads": 10,
      "set_id": ""
    },
    "allocatedResources": {
      "cpu": 1,
      "mem": 1024
    }
  }
}`);