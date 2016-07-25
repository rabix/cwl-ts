export interface SoftwarePackage {


    /**
     * The common name of the software to be configured.
     */
        package: string;


    /**
     * The (optional) version of the software to configured.
     */
    version?: string[];


    /**
     * Must be one or more IRIs identifying resources for installing or
     * enabling the software.  Implementations may provide resolvers which map
     * well-known software spec IRIs to some configuration action.
     *
     * For example, an IRI `https://packages.debian.org/jessie/bowtie` could
     * be resolved with `apt-get install bowtie`.  An IRI
     * `https://anaconda.org/bioconda/bowtie` could be resolved with `conda
     * install -c bioconda bowtie`.
     *
     * Tools may also provide IRIs to index entries such as
     * [RRID](http://www.identifiers.org/rrid/), such as
     * `http://identifiers.org/rrid/RRID:SCR_005476`
     *
     */
    specs?: string[];

}