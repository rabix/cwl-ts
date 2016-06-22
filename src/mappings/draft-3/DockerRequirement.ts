import {ProcessRequirement} from "./ProcessRequirement";


/**
 * Indicates that a workflow component should be run in a
 * [Docker](http://docker.com) container, and specifies how to fetch or build
 * the image.
 *
 * If a CommandLineTool lists `DockerRequirement` under
 * `hints` or `requirements`, it may (or must) be run in the specified Docker
 * container.
 *
 * The platform must first acquire or install the correct Docker image as
 * specified by `dockerPull`, `dockerImport`, `dockerLoad` or `dockerFile`.
 *
 * The platform must execute the tool in the container using `docker run` with
 * the appropriate Docker image and tool command line.
 *
 * The workflow platform may provide input files and the designated output
 * directory through the use of volume bind mounts.  The platform may rewrite
 * file paths in the input object to correspond to the Docker bind mounted
 * locations.
 *
 * When running a tool contained in Docker, the workflow platform must not
 * assume anything about the contents of the Docker container, such as the
 * presence or absence of specific software, except to assume that the
 * generated command line represents a valid command within the runtime
 * environment of the container.
 *
 * ## Interaction with other requirements
 *
 * If [EnvVarRequirement](#EnvVarRequirement) is specified alongside a
 * DockerRequirement, the environment variables must be provided to Docker
 * using `--env` or `--env-file` and interact with the container's preexisting
 * environment as defined by Docker.
 *
 */

export interface DockerRequirement extends ProcessRequirement {


    /**
     * Specify a Docker image to retrieve using `docker pull`.
     */
    dockerPull?: string;


    /**
     * Specify a HTTP URL from which to download a Docker image using `docker load`.
     */
    dockerLoad?: string;


    /**
     * Supply the contents of a Dockerfile which will be built using `docker build`.
     */
    dockerFile?: string;


    /**
     * Provide HTTP URL to download and gunzip a Docker images using `docker import.
     */
    dockerImport?: string;


    /**
     * The image id that will be used for `docker run`.  May be a
     * human-readable image name or the image identifier hash.  May be skipped
     * if `dockerPull` is specified, in which case the `dockerPull` image id
     * must be used.
     *
     */
    dockerImageId?: string;


    /**
     * Set the designated output directory to a specific location inside the
     * Docker container.
     *
     */
    dockerOutputDirectory?: string;

}