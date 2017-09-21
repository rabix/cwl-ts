export default [
    {
        source: {id: "tool_step", type: "Step"},
        destination: {id: "out/tool_step/stepOutputFile", type: "StepOutput"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "tool_step", type: "Step"},
        destination: {id: "out/tool_step/stepOutputString", type: "StepOutput"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "tool_step", type: "Step"},
        destination:
            {
                id: "out/tool_step/stepOutputArrayString",
                type: "StepOutput"
            },
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "tool_step", type: "Step"},
        destination: {id: "out/tool_step/stepOutputArrayFile", type: "StepOutput"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "tool_step", type: "Step"},
        destination:
            {
                id: "out/tool_step/stepOutputFileTypesDEF",
                type: "StepOutput"
            },
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "tool_step", type: "Step"},
        destination: {id: "out/tool_step/stepOutputFileTypesB", type: "StepOutput"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputFile", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputString", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputArrayString", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputArrayFile", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputFileTypesABC", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "in/tool_step/stepInputFileTypesA", type: "StepInput"},
        destination: {id: "tool_step", type: "Step"},
        isVisible: false,
        isValid: true
    },
    {
        source: {id: "out/inputPortFile/inputPortFile", type: "WorkflowInput"},
        destination: {id: "in/tool_step/stepInputFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesABC/inputPortFileTypesABC",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesA/inputPortFileTypesA",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortString/inputPortString",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputString", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortArrayString/inputPortArrayString",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputArrayString", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortString/inputPortString",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputArrayString", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/InputPortArrayFile/InputPortArrayFile",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputArrayFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesABC/inputPortFileTypesABC",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputArrayFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesA/inputPortFileTypesA",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputArrayFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/inputPortFile/inputPortFile", type: "WorkflowInput"},
        destination: {id: "in/tool_step/stepInputArrayFile", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesABC/inputPortFileTypesABC",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFileTypesABC", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesA/inputPortFileTypesA",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFileTypesABC", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/inputPortFile/inputPortFile", type: "WorkflowInput"},
        destination: {id: "in/tool_step/stepInputFileTypesABC", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesA/inputPortFileTypesA",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFileTypesA", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortFileTypesABC/inputPortFileTypesABC",
                type: "WorkflowInput"
            },
        destination: {id: "in/tool_step/stepInputFileTypesA", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/inputPortFile/inputPortFile", type: "WorkflowInput"},
        destination: {id: "in/tool_step/stepInputFileTypesA", type: "StepInput"},
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputString", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortString/outputPortString",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/tool_step/stepOutputFileTypesDEF",
                type: "StepOutput"
            },
        destination:
            {
                id: "in/outputPortFileTypesDEF/outputPortFileTypesDEF",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFile", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortFileTypesDEF/outputPortFileTypesDEF",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFileTypesB", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortFileTypesB/outputPortFileTypesB",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFile", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortFileTypesB/outputPortFileTypesB",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFile", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortFile/outputPortFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/tool_step/stepOutputFileTypesDEF",
                type: "StepOutput"
            },
        destination:
            {
                id: "in/outputPortFile/outputPortFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFileTypesB", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortFile/outputPortFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/tool_step/stepOutputArrayString",
                type: "StepOutput"
            },
        destination:
            {
                id: "in/outputPortArrayString/outputPortArrayString",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputString", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortArrayString/outputPortArrayString",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputArrayFile", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortArrayFile/outputPortArrayFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/tool_step/stepOutputFileTypesDEF",
                type: "StepOutput"
            },
        destination:
            {
                id: "in/outputPortArrayFile/outputPortArrayFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFileTypesB", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortArrayFile/outputPortArrayFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source: {id: "out/tool_step/stepOutputFile", type: "StepOutput"},
        destination:
            {
                id: "in/outputPortArrayFile/outputPortArrayFile",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortValidConnection/inputPortValidConnection",
                type: "WorkflowInput"
            },
        destination:
            {
                id: "in/outputPortValidConnection/outputPortValidConnection",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    },
    {
        source:
            {
                id: "out/inputPortInvalidConnection/inputPortInvalidConnection",
                type: "WorkflowInput"
            },
        destination:
            {
                id: "in/outputPortInvalidConnection/outputPortInvalidConnection",
                type: "WorkflowOutput"
            },
        isVisible: true,
        isValid: true
    }];
