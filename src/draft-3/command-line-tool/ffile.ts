/**
 * Represents a file (or group of files if secondaryFiles is specified) that must be
 * accessible by tools using standard POSIX file system call API such as open(2) and read(2).
 */
export interface File {

    class: "File";
    
    /**
     * The path to the file.
     */
    path: string;


    /**
     * Optional hash code for validating file integrity. Currently must be in the form
     * "sha1$ + hexidecimal string" using the SHA-1 algorithm.
     */
    checksum?: string;

    /**
     * Optional file size.
     */
    size?: number;

    /**
     * A list of additional files that are associated with the primary file and must be
     * transferred alongside the primary file. Examples include indexes of the primary file,
     * or external references which must be included when loading primary document.
     *
     * A file object listed in secondaryFiles may itself include secondaryFiles
     * for which the same rules apply.
     */
    secondaryFiles?: File[];

    /**
     * The format of the file. This must be a URI of a concept node
     * that represents the file format,
     * preferrably defined within an ontology.
     * If no ontology is available, file formats may be tested by exact match.
     *
     * Reasoning about format compatability must be done by checking that an input
     * file format is the same, owl:equivalentClass or rdfs:subClassOf the format
     * required by the input parameter. owl:equivalentClass is transitive
     * with rdfs:subClassOf, e.g. if <B> owl:equivalentClass <C> and <B> owl:subclassOf <A>
     * then infer <C> owl:subclassOf <A>.
     *
     * File format ontologies may be provided in the "$schema" metadata
     * at the root of the document.
     * If no ontologies are specified in $schema, the runtime
     * may perform exact file format matches.
     */
    format?: string;

}

