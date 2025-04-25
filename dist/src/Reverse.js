"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
class Reverse {
    getOne() {
        throw new errors_1.RelationAccessError();
    }
    getAll() {
        throw new errors_1.RelationAccessError();
    }
}
exports.default = Reverse;
