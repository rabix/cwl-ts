export interface DocType {


    /**
     * A documentation string for this type, or an array of strings which should be concatenated.
     */
    doc?: string | string[];


    /**
     * Hint to indicate that during documentation generation, documentation
     * for this type should appear in a subsection under `docParent`.
     *
     */
    docParent?: string;


    /**
     * Hint to indicate that during documentation generation, documentation
     * for `docChild` should appear in a subsection under this type.
     *
     */
    docChild?: string | string[];


    /**
     * Hint to indicate that during documentation generation, documentation
     * for this type should appear after the `docAfter` section at the same
     * level.
     *
     */
    docAfter?: string;

}