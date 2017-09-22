import {expect} from "chai";
import * as chai from "chai";
import * as chaiSpies from "chai-spies";
import {ValidationBase} from "./ValidationBase";
import {ErrorCode} from "./ErrorCode";

chai.should();
chai.use(chaiSpies);

class Parent extends ValidationBase {
    child: Child;
    constructor() {
        super("parent");
        this.child = new Child(`${this.loc}.child`);
        this.child.setValidationCallback((err) => this.updateValidity(err));
    }

    setChildError(code) {
        this.child.setError(code);
    }
}
class Child extends ValidationBase {
    setError(code: ErrorCode) {
        this.setIssue({[`${this.loc}`]: [{
            type: "error",
            code
        }]});
    }

    removeAllIDError() {
        this.clearIssue(ErrorCode.ID_ALL);
    }
}

describe("ValidationBase", () => {
    let parent: Parent;

    beforeEach(() => {
        parent = new Parent();
    });

    describe("updateValidity", () => {
        it("should propagate from child to parent", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            expect (parent.errors).to.have.lengthOf(1);
        });

        it("should propagate two errors from child to parent", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect (parent.errors).to.have.lengthOf(2);
        });

        it("should clear only one error", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect (parent.errors).to.have.lengthOf(2);

            const spy = chai.spy.on(parent.child, "cleanValidity");

            parent.child.clearIssue(ErrorCode.ID_DUPLICATE);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should not propagate clean if it doesn't have error", () => {
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect (parent.errors).to.have.lengthOf(1);

            const spy = chai.spy.on(parent.child, "updateValidity");

            parent.child.clearIssue(ErrorCode.ID_DUPLICATE);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });
    });
});