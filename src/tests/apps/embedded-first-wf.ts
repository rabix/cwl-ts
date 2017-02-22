export default JSON.parse(`{
  "class": "Workflow",
  "cwlVersion": "v1.0",
  "inputs": [
    {
      "id": "inp",
      "type": "File"
    },
    {
      "id": "ex",
      "type": "string"
    }
  ],
  "outputs": [
    {
      "id": "classout",
      "type": "File",
      "outputSource": "compile/classfile"
    }
  ],
  "steps": [
    {
      "run": {
        "cwlVersion": "v1.0",
        "class": "CommandLineTool",
        "baseCommand": [
          "tar",
          "xf"
        ],
        "inputs": [
          {
            "id": "tarfile",
            "type": "File",
            "inputBinding": {
              "position": 1
            }
          },
          {
            "id": "extractfile",
            "type": "string",
            "inputBinding": {
              "position": 2
            }
          }
        ],
        "outputs": [
          {
            "id": "example_out",
            "type": "File",
            "outputBinding": {
              "glob": "$(inputs.extractfile)"
            }
          }
        ]
      },
      "id": "untar",
      "in": [
        {
          "id": "tarfile",
          "source": "inp"
        },
        {
          "id": "extractfile",
          "source": "ex"
        }
      ],
      "out": [
        {
          "id": "example_out"
        }
      ]
    },
    {
      "run": {
        "cwlVersion": "v1.0",
        "class": "CommandLineTool",
        "label": "Example trivial wrapper for Java 7 compiler",
        "hints": [
          {
            "id": "DockerRequirement",
            "dockerPull": "java:7-jdk"
          }
        ],
        "baseCommand": "javac",
        "arguments": [
          "-d",
          "$(runtime.outdir)"
        ],
        "inputs": [
          {
            "id": "src",
            "type": "File",
            "inputBinding": {
              "position": 1
            }
          }
        ],
        "outputs": [
          {
            "id": "classfile",
            "type": "File",
            "outputBinding": {
              "glob": "*.class"
            }
          }
        ]
      },
      "id": "compile",
      "in": [
        {
          "id": "src",
          "source": "untar/example_out"
        }
      ],
      "out": [
        {
          "id": "classfile"
        }
      ]
    }
  ]
}`);