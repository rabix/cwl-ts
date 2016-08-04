/**
 * Only valid as a `type` for a `CommandLineTool` output with no
 `outputBinding` set.

 The following
 ```
 outputs:
 an_output_name:
 type: stdout

 stdout: a_stdout_file
 ```
 is equivalent to
 ```
 outputs:
 an_output_name:
 type: File
 streamable: true
 outputBinding:
 glob: a_stdout_file

 stdout: a_stdout_file
 ```

 If there is no `stdout` name provided, a random filename will be created.
 For example, the following
 ```
 outputs:
 an_output_name:
 type: stdout
 ```
 is equivalent to
 ```
 outputs:
 an_output_name:
 type: File
 streamable: true
 outputBinding:
 glob: random_stdout_filenameABCDEFG

 stdout: random_stdout_filenameABCDEFG
 ```

 */
export type stdout = "stdout";