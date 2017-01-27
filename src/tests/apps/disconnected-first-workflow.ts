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
    },
    {
      "id": "extra"
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
      "run": "tar-param.cwl",
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
      "run": "arguments.cwl",
      "id": "compile",
      "in": [
        {
          "id": "src",
          "source": "extra"
        }
      ],
      "out": [
        {
          "id": "classfile"
        },
        {
          "id": "some_file"
        }
      ]
    }
  ]
}`)