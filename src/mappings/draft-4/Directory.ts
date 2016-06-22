/**
 * Represents a directory to present to a command line tool. This could be a virtual
 * directory, made of files assembled from a number of concrete directories.
 *
 */

export interface Directory {


    /**
     * Must be `Directory` to indicate this object describes a Directory.
     */
        class: "Directory";


    /**
     * The path to the directory.
     */
    path: string;

}