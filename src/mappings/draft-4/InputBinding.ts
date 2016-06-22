export interface InputBinding {


    /**
     * Only valid when `type: File` or is an array of `items: File`.
     *
     * Read up to the first 64 KiB of text from the file and place it in the
     * "contents" field of the file object for use by expressions.
     *
     */
    loadContents?: boolean;

}