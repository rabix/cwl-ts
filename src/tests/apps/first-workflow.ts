export default JSON.parse(`{
  "cwlVersion": "v1.0",
  "class": "Workflow",
  "inputs": {
    "inp": "File",
    "ex": "string"
  },
  "outputs": {
    "classout": {
      "type": "File",
      "outputSource": "compile/classfile"
    }
  },
  "steps": {
    "untar": {
      "run": "tar-param.cwl",
      "in": {
        "tarfile": "inp",
        "extractfile": "ex"
      },
      "out": [
        "example_out"
      ]
    },
    "compile": {
      "run": "arguments.cwl",
      "in": {
        "src": "untar/example_out"
      },
      "out": [
        "classfile",
        "some_file"
      ]
    }
  }
}`);

const inputs = [
    {id: "inp", type: "File"},
    {id: "ex", type: "string"}
];

const outputs = [
    {
        id: "classout",
        type: "File",
        outputSource: "compile/classfile"
    }
];

const steps = [
    {
        id: "untar",
        in: [
            {id: "tarfile", source: "inp"},
            {id: "extractfile", source: "ex"}
        ],
        out: [
            {id: "example_out"}
        ]
    },
    {
        id: "compile",
        in: [
            {id: "src", source: "untar/example_out"}
        ],
        out: [
            {id: "classfile"}
        ]
    }
];