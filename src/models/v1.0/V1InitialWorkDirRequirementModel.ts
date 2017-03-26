import {CreateFileRequirementModel} from "../generic/CreateFileRequirementModel";
import {V1DirentModel} from "./V1DirentModel";
import {InitialWorkDirRequirement} from "../../mappings/v1.0/InitialWorkDirRequirement";
import {Dirent} from "../../mappings/v1.0/Dirent";
import {spreadAllProps, spreadSelectProps} from "../helpers/utils";


export class V1InitialWorkDirRequirementModel extends CreateFileRequirementModel {
    'class'                  = "InitialWorkDirRequirement";
    listing: V1DirentModel[] = [];

    constructor(req?: InitialWorkDirRequirement, loc?: string) {
        super(loc);

        if (req) this.deserialize(req);
    }

    addDirent(d: Dirent): V1DirentModel {
        const dirent = new V1DirentModel(d, `${this.loc}.listing[${this.listing.length}]`);
        dirent.setValidationCallback(err => this.updateValidity(err));
        this.listing.push(dirent);

        return dirent;
    }


    serialize(): InitialWorkDirRequirement {
        const base = {
            'class': "InitialWorkDirRequirement",
            listing: this.listing.map(d => d.serialize())
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
        if (keys.length === 1 && keys[0] === "class" && customPropsKeys.length === 0) {
            return undefined;
        }

        return spreadAllProps(base, this.customProps);
    }

    deserialize(attr: InitialWorkDirRequirement): void {
        let serializedKeys = ["class"];

        // listing is a list of dirents
        if (Array.isArray(attr.listing) && attr.listing[0] && (<Dirent> attr.listing[0]).entryname) {
            serializedKeys.push("listing");
            // deserialize dirents to model
            this.listing = attr.listing.map(d => this.addDirent(<Dirent> d));

        } else if (Array.isArray(attr.listing)) {
            // save original listing, model listing will be blank and dirents can be added to it
            this.customProps.listing = attr.listing;
        } else if (typeof attr === "string") {
            console.warn("InitialWorkDirRequirement that is type Expression is currently not supported");
            return;
        }

        spreadSelectProps(attr, this.customProps, serializedKeys);
    }
}