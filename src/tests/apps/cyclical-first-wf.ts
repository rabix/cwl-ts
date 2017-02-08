export default JSON.parse(`{
  "cwlVersion": "v1.0",
  "class": "Workflow",
  "inputs": {
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
        "tarfile": "compile/classfile",
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