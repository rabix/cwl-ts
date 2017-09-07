import {CreateFileRequirementModel} from "../generic/CreateFileRequirementModel";
import {V1DirentModel} from "./V1DirentModel";
import {InitialWorkDirRequirement} from "../../mappings/v1.0/InitialWorkDirRequirement";
import {Dirent} from "../../mappings/v1.0/Dirent";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";
import {EventHub} from "../helpers/EventHub";
import {ExpressionModel} from "../generic/ExpressionModel";
import {V1ExpressionModel} from "./V1ExpressionModel";


export class V1InitialWorkDirRequirementModel extends CreateFileRequirementModel {
    'class' = "InitialWorkDirRequirement";
    listing: Array<V1DirentModel | ExpressionModel> = [];

    constructor(req?: InitialWorkDirRequirement, loc?: string, eventHub?: EventHub) {
        super(loc, eventHub);

        if (req) this.deserialize(req);
    }

    addDirent(d: Dirent): V1DirentModel {
        const dirent = new V1DirentModel(d, `${this.loc}.listing[${this.listing.length}]`, this.eventHub);
        dirent.setValidationCallback(err => this.updateValidity(err));
        this.listing.push(dirent);

        return dirent;
    }

    addExpression(e: V1ExpressionModel | string = "") {
        const expression = new V1ExpressionModel(e, `${this.loc}.listing[${this.listing.length}]`, this.eventHub);
        expression.setValidationCallback(err => this.updateValidity(err));
        this.listing.push(expression);

        return expression;
    }

    serialize(): InitialWorkDirRequirement {
        const base = {
            'class': "InitialWorkDirRequirement",
            listing: this.listing.reduce((acc, item) => {
                const serialized = item.serialize();

                if (serialized && ((item instanceof ExpressionModel) || (serialized.entryname && serialized.entry))) {
                    acc.push(serialized);
                }

                return acc;
            }, [])
        };

        if (this.customProps.listing) {
            base.listing = base.listing.concat(this.customProps.listing);
            const c      = {...{}, ...this.customProps};
            delete c.listing;
            return spreadAllProps(base, c);
        }

        // don't serialize if the only property that is being serialized is the class
        const keys            = Object.keys(base);
        const customPropsKeys = Object.keys(this.customProps);
        if (keys.length === 2 &&
            keys[0] === "class" &&
            keys[1] === "listing" &&
            !base.listing.length &&
            customPropsKeys.length === 0) {

            return undefined;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: InitialWorkDirRequirement): void {

        let listings = [];
        let customProperties = [];
        let serializedKeys = ["class"];

        if (Array.isArray(attr.listing)) {
            attr.listing.forEach((listing) => {

                if (listing) {
                    if ((<Dirent> listing).entryname && (<Dirent> listing).entry) {
                        const any = this.addDirent(<Dirent> listing);
                        listings.push(any);
                    } else if (typeof listing === "string") {
                        listings.push(this.addExpression(listing));
                    } else {
                        customProperties.push(listing);
                    }
                }
            });
        }

        this.listing = listings;

        if (listings) {
            serializedKeys.push("listing");
        }
        this.customProps.listing = customProperties;

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}