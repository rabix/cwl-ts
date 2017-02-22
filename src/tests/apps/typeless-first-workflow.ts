export default JSON.parse(`{
  "cwlVersion": "v1.0",
  "class": "Workflow",
  "inputs": {
    "inp": "null",
    "ex": "null"
  },
  "outputs": {
    "classout": {
      "type": "null",
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