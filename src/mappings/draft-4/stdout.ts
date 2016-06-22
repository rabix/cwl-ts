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
 outputBinding:
 glob: a_stdout_file

 stdout: a_stdout_file
 ```

 If there is no `stdout` name provided, a random filename will be created.

 */
export type stdout = "stdout";