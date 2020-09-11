export type LoadListingEnum = "no_listing" | "shallow_listing" | "deep_listing";

export class LoadListing {

    value: LoadListingEnum = "deep_listing";

    constructor(value: LoadListingEnum) {
        if (value === "shallow_listing" || value === "no_listing") {
            this.value = value;
        }
    }

    toString() {
        return this.value;
    }

}
