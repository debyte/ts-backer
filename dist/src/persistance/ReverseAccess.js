"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const arrays_1 = require("../util/arrays");
const Reverse_1 = __importDefault(require("../Reverse"));
const spec_1 = require("../spec");
class ReverseAccess extends Reverse_1.default {
    constructor(spec, field, id) {
        super();
        this.spec = spec;
        this.field = field;
        this.id = id;
    }
    async getOne() {
        return (0, arrays_1.first)(await this.getAll());
    }
    async getAll() {
        if (this.id) {
            const dao = (0, __1.peek)(this.field.relationModel);
            const f = (0, spec_1.reverseField)(dao.spec, this.spec, this.field);
            if (f) {
                return dao.getByField(f.name, this.id);
            }
        }
        return [];
    }
}
exports.default = ReverseAccess;
