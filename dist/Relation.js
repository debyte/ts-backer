"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class Relation {
    constructor(related) {
        if (typeof related === "string") {
            this.id = related;
        }
        else if (related) {
            this.id = related.id;
        }
    }
    get() {
        throw new errors_1.RelationAccessError();
    }
    set(_related) {
        throw new errors_1.RelationAccessError();
    }
    unset() {
        throw new errors_1.RelationAccessError();
    }
}
exports.default = Relation;
