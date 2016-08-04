import {File} from "./File";


/**
 * Represents a directory to present to a command line tool.
 *
 */

export interface Directory {


    /**
     * Must be `Directory` to indicate this object describes a Directory.
     */
        class: "Directory";


    /**
     * An IRI that identifies the directory resource.  This may be a relative
     * reference, in which case it must be resolved using the base IRI of the
     * document.  The location may refer to a local or remote resource.  If
     * the `listing` field is not set, the implementation must use the
     * location IRI to retrieve directory listing.  If an implementation is
     * unable to retrieve the directory listing stored at a remote resource (due to
     * unsupported protocol, access denied, or other issue) it must signal an
     * error.
     *
     * If the `location` field is not provided, the `listing` field must be
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
     * The local path where the Directory is made available prior to executing a
     * CommandLineTool.  This must be set by the implementation.  This field
     * must not be used in any other context.  The command line tool being
     * executed must be able to to access the directory at `path` using the POSIX
     * `opendir(2)` syscall.
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
     * The base name of the directory, that is, the name of the file without any
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
     * List of files or subdirectories contained in this directory.  The name
     * of each file or subdirectory is determined by the `basename` field of
     * each `File` or `Directory` object.  It is an error if a `File` shares a
     * `basename` with any other entry in `listing`.  If two or more
     * `Directory` object share the same `basename`, this must be treated as
     * equivalent to a single subdirectory with the listings recursively
     * merged.
     *
     */
    listing?: Array<File | Directory>;

}