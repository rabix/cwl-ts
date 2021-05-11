import {Optional} from "../../types";

export type PickValueMethod = "first_non_null" | "the_only_non_null" | "all_non_null";

export class PickValue {

    value: PickValueMethod;
    readonly originalValue: Optional<PickValueMethod>;

    constructor(value?: PickValueMethod) {

        this.originalValue = value;

        if (this.originalValue) {
            this.value = value;
        }
    }

    toString() {
        return this.value;
    }

    serialize(): Optional<PickValueMethod> {

        if (this.originalValue ||
            this.value === "first_non_null" ||
            this.value === "the_only_non_null" ||
            this.value === "all_non_null") {
            return this.value;
        }
    }

}
