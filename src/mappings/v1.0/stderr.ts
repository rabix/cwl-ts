/**
 * Only valid as a `type` for a `CommandLineTool` output with no
 `outputBinding` set.

 The following
 ```
 outputs:
 an_output_name:
 type: stderr

 stderr: a_stderr_file
 ```
 is equivalent to
 ```
 outputs:
 an_output_name:
 type: File
 streamable: true
 outputBinding:
 glob: a_stderr_file

 stderr: a_stderr_file
 ```

 If there is no `stderr` name provided, a random filename will be created.
 For example, the following
 ```
 outputs:
 an_output_name:
 type: stderr
 ```
 is equivalent to
 ```
 outputs:
 an_output_name:
 type: File
 streamable: true
 outputBinding:
 glob: random_stderr_filenameABCDEFG

 stderr: random_stderr_filenameABCDEFG
 ```

 */
export type stderr = "stderr";