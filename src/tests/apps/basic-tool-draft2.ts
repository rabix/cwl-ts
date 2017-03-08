export default JSON.parse(`{
	"class": "CommandLineTool",
	"label": "basic-tool",
	"inputs": [{
		"type": [
			"null",
			"string"
		],
		"inputBinding": {
			"separate": true,
			"sbg:cmdInclude": true
		},
		"id": "#toExpose"
	}, {
		"type": [
			"null",
			"int"
		],
		"inputBinding": {
			"separate": true,
			"sbg:cmdInclude": true
		},
		"id": "#toInclude"
	}, {
		"type": [
			"null",
			"boolean"
		],
		"id": "#default"
	}, {
		"type": [
			"File"
		],
		"inputBinding": {
			"separate": true,
			"loadContents": false,
			"sbg:cmdInclude": true
		},
		"id": "#requiredFile"
	}, {
		"type": [
			"null", {
				"type": "array",
				"items": "File"
			}
		],
		"sbg:stageInput": null,
		"id": "#fileArr"
	}, {
		"type": [
			"null", {
				"type": "array",
				"items": "string"
			}
		],
		"sbg:stageInput": null,
		"id": "#stringArr"
	}, {
		"type": [
			"null", "string"
		],
		"id": "#new_input"
	}],
	"outputs": [{
		"type": [
			"null",
			"File"
		],
		"id": "#fileOutput"
	}],
	"hints": [{
		"class": "DockerRequirement",
		"dockerPull": "ubuntu",
		"dockerImageId": ""
	}],
	"baseCommand": [
		"basic",
		"tool"
	],
	"stdin": "",
	"stdout": "",
	"successCodes": [],
	"temporaryFailCodes": [],
	"arguments": [],
	"sbg:id": "maya/test/basic-tool/4",
	"cwlVersion": "sbg:draft-2"
}`);