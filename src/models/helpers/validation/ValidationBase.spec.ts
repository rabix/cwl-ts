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
        this.setIssue({
            [`${this.loc}`]: [{
                type: "error",
                code
            }]
        });
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
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should propagate two errors from child to parent", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect(parent.errors).to.have.lengthOf(2);
        });

        it("should clear only one error", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect(parent.errors).to.have.lengthOf(2);

            const spy = chai.spy.on(parent.child, "cleanValidity");

            parent.child.clearIssue(ErrorCode.ID_DUPLICATE);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should not propagate clean if it doesn't have error", () => {
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect(parent.errors).to.have.lengthOf(1);

            const spy = chai.spy.on(parent.child, "updateValidity");

            parent.child.clearIssue(ErrorCode.ID_DUPLICATE);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should not propagate if stopPropagation is passed", () => {
            const spy = chai.spy.on(parent, "updateValidity");

            parent.child.setIssue({
                [parent.child.loc]: {
                    message: "",
                    type: "error",
                    code: ErrorCode.ID_INVALID_CHAR
                }
            }, true);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.be.empty;
            expect(parent.child.errors).to.have.lengthOf(1);
        });

        it("should not duplicate errors with same code and message", () => {
            parent.child.setIssue({
                child: {
                    type: "error",
                    code: ErrorCode.ID_DUPLICATE,
                    message: "message"
                }
            });
            parent.child.setIssue({
                child: {
                    type: "error",
                    code: ErrorCode.ID_DUPLICATE,
                    message: "message"
                }
            });
            expect(parent.errors).to.have.lengthOf(1);
            expect(parent.child.errors).to.have.lengthOf(1);
        });

        it("should duplicate errors with same code but different message", () => {
            parent.child.setIssue({
                child: {
                    type: "error",
                    code: ErrorCode.ID_DUPLICATE,
                    message: "message"
                }
            });
            parent.child.setIssue({
                child: {
                    type: "error",
                    code: ErrorCode.ID_DUPLICATE,
                    message: "different message"
                }
            });
            expect(parent.errors).to.have.lengthOf(2);
            expect(parent.child.errors).to.have.lengthOf(2);
        });
    });

    describe("clearIssue", () => {
        it("should clear only one error", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect(parent.errors).to.have.lengthOf(2);

            const spy = chai.spy.on(parent.child, "cleanValidity");

            parent.child.clearIssue(ErrorCode.ID_DUPLICATE);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should clear all errors under if a group code is passed", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            expect(parent.errors).to.have.lengthOf(2);

            const spy = chai.spy.on(parent.child, "cleanValidity");

            parent.child.clearIssue(ErrorCode.ID_ALL);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(0);
        });

        it("should clear only group if group code is passed", () => {
            parent.setChildError(ErrorCode.ID_DUPLICATE);
            parent.setChildError(ErrorCode.ID_INVALID_CHAR);
            parent.setChildError(ErrorCode.EXPR_REFERENCE);
            expect(parent.errors).to.have.lengthOf(3);

            const spy = chai.spy.on(parent.child, "cleanValidity");

            parent.child.clearIssue(ErrorCode.ID_ALL);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(1);
        });

        it("should not call parent's updateValidity if there are no errors", () => {

            const spy = chai.spy.on(parent, "updateValidity");

            parent.child.clearIssue(ErrorCode.ID_ALL);

            expect(spy).to.not.have.been.called;
            expect(parent.errors).to.have.lengthOf(0);
        });
    });
});