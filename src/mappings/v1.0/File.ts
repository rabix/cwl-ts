import {Directory} from "./Directory";


/**
 * Represents a file (or group of files if `secondaryFiles` is specified) that
 * must be accessible by tools using standard POSIX file system call API such as
 * open(2) and read(2).
 *
 */

export interface File {


    /**
     * Must be `File` to indicate this object describes a file.
     */
        class: "File";


    /**
     * An IRI that identifies the file resource.  This may be a relative
     * reference, in which case it must be resolved using the base IRI of the
     * document.  The location may refer to a local or remote resource; the
     * implementation must use the IRI to retrieve file content.  If an
     * implementation is unable to retrieve the file content stored at a
     * remote resource (due to unsupported protocol, access denied, or other
     * issue) it must signal an error.
     *
     * If the `location` field is not provided, the `contents` field must be
     * provided.  The implementation must assign a unique identifier for
     * the `location` field.
     *
     * If the `path` field is provided but the `location` field is not, an
     * implementation may assign the value of the `path` field to `location`,
     * then follow the rules above.
     *
     */
    location?: string;


    /**
     * The local host path where the File is available when a CommandLineTool is
     * executed.  This field must be set by the implementation.  The final
     * path component must match the value of `basename`.  This field
     * must not be used in any other context.  The command line tool being
     * executed must be able to to access the file at `path` using the POSIX
     * `open(2)` syscall.
     *
     * As a special case, if the `path` field is provided but the `location`
     * field is not, an implementation may assign the value of the `path`
     * field to `location`, and remove the `path` field.
     *
     * If the `path` contains [POSIX shell metacharacters](http://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html#tag_18_02)
     * (`|`,`&`, `;`, `<`, `>`, `(`,`)`, `$`,`` ` ``, `\`, `"`, `'`,
     * `<space>`, `<tab>`, and `<newline>`) or characters
     * [not allowed](http://www.iana.org/assignments/idna-tables-6.3.0/idna-tables-6.3.0.xhtml)
     * for [Internationalized Domain Names for Applications](https://tools.ietf.org/html/rfc6452)
     * then implementations may terminate the process with a
     * `permanentFailure`.
     *
     */
    path?: string;


    /**
     * The base name of the file, that is, the name of the file without any
     * leading directory path.  The base name must not contain a slash `/`.
     *
     * If not provided, the implementation must set this field based on the
     * `location` field by taking the final path component after parsing
     * `location` as an IRI.  If `basename` is provided, it is not required to
     * match the value from `location`.
     *
     * When this file is made available to a CommandLineTool, it must be named
     * with `basename`, i.e. the final component of the `path` field must match
     * `basename`.
     *
     */
    basename?: string;


    /**
     * The name of the directory containing file, that is, the path leading up
     * to the final slash in the path such that `dirname + '/' + basename ==
     * path`.
     *
     * The implementation must set this field based on the value of `path`
     * prior to evaluating parameter references or expressions in a
     * CommandLineTool document.  This field must not be used in any other
     * context.
     *
     */
    dirname?: string;


    /**
     * The basename root such that `nameroot + nameext == basename`, and
     * `nameext` is empty or begins with a period and contains at most one
     * period.  For the purposess of path splitting leading periods on the
     * basename are ignored; a basename of `.cshrc` will have a nameroot of
     * `.cshrc`.
     *
     * The implementation must set this field automatically based on the value
     * of `basename` prior to evaluating parameter references or expressions.
     *
     */
    nameroot?: string;


    /**
     * The basename extension such that `nameroot + nameext == basename`, and
     * `nameext` is empty or begins with a period and contains at most one
     * period.  Leading periods on the basename are ignored; a basename of
     * `.cshrc` will have an empty `nameext`.
     *
     * The implementation must set this field automatically based on the value
     * of `basename` prior to evaluating parameter references or expressions.
     *
     */
    nameext?: string;


    /**
     * Optional hash code for validating file integrity.  Currently must be in the form
     * "sha1$ + hexadecimal string" using the SHA-1 algorithm.
     *
     */
    checksum?: string;


    /**
     * Optional file size
     */
    size?: number;


    /**
     * A list of additional files that are associated with the primary file
     * and must be transferred alongside the primary file.  Examples include
     * indexes of the primary file, or external references which must be
     * included when loading primary document.  A file object listed in
     * `secondaryFiles` may itself include `secondaryFiles` for which the same
     * rules apply.
     *
     */
    secondaryFiles?: Array<File | Directory>;


    /**
     * The format of the file: this must be an IRI of a concept node that
     * represents the file format, preferrably defined within an ontology.
     * If no ontology is available, file formats may be tested by exact match.
     *
     * Reasoning about format compatability must be done by checking that an
     * input file format is the same, `owl:equivalentClass` or
     * `rdfs:subClassOf` the format required by the input parameter.
     * `owl:equivalentClass` is transitive with `rdfs:subClassOf`, e.g. if
     * `<B> owl:equivalentClass <C>` and `<B> owl:subclassOf <A>` then infer
     * `<C> owl:subclassOf <A>`.
     *
     * File format ontologies may be provided in the "$schema" metadata at the
     * root of the document.  If no ontologies are specified in `$schema`, the
     * runtime may perform exact file format matches.
     *
     */
    format?: string;


    /**
     * File contents literal.  Maximum of 64 KiB.
     *
     * If neither `location` nor `path` is provided, `contents` must be
     * non-null.  The implementation must assign a unique identifier for the
     * `location` field.  When the file is staged as input to CommandLineTool,
     * the value of `contents` must be written to a file.
     *
     * If `loadContents` of `inputBinding` or `outputBinding` is true and
     * `location` is valid, the implementation must read up to the first 64
     * KiB of text from the file and place it in the "contents" field.
     *
     */
    contents?: string;

}