export default JSON.parse(`{
  "cwlVersion": "v1.0",
  "class": "Workflow",
  "inputs": {
    "inp": "File"
  },
  "outputs": {
    "classout": {
      "type": "File",
      "outputSource": "untar/example_out"
    }
  },
  "steps": {
    "untar": {
      "run": "tar-param.cwl",
      "in": [
        {
          "id": "tarfile",
          "source": "inp"
        },
        {
          "id": "extractfile"
        }
      ],
      "out": [
        "example_out"
      ]
    }
  }
}`);