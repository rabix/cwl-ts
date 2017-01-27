export default JSON.parse(`{
  "cwlVersion": "v1.0",
  "class": "Workflow",
  "inputs": [

  ],
  "outputs": {
    "classout": {
      "type": "File",
      "outputSource": "compile/classout"
    }
  },
  "requirements": [
    {
      "class": "SubworkflowFeatureRequirement"
    }
  ],
  "steps": {
    "compile": {
      "run": "1st-workflow.cwl",
      "in": {
        "inp": {
          "source": "create-tar/tar"
        },
        "ex": {
          "default": "Hello.java"
        }
      },
      "out": [
        "classout"
      ]
    },
    "create-tar": {
      "requirements": [
        {
          "class": "InitialWorkDirRequirement",
          "listing": [
            {
              "entryname": "Hello.java",
              "entry": "public class Hello {\n  public static void main(String[] argv) {\n      System.out.println(\"Hello from Java\");\n  }\n}\n"
            }
          ]
        }
      ],
      "in": [

      ],
      "out": [
        "tar"
      ],
      "run": {
        "class": "CommandLineTool",
        "requirements": [
          {
            "class": "ShellCommandRequirement"
          }
        ],
        "arguments": [
          {
            "shellQuote": false,
            "valueFrom": "date\ntar cf hello.tar Hello.java\ndate\n"
          }
        ],
        "inputs": [

        ],
        "outputs": {
          "tar": {
            "type": "File",
            "outputBinding": {
              "glob": "hello.tar"
            }
          }
        }
      }
    }
  }
}
`);