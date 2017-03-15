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
    },
    "other_output": {
       "type": "File[]",
       "outputSource": ["untar/example_out", "compile/some_file"]
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