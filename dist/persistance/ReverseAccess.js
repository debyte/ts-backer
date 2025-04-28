"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../cache");
const Reverse_1 = __importDefault(require("../Reverse"));
const spec_1 = require("../spec");
const arrays_1 = require("../util/arrays");
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
            const dao = cache_1.cache.peek(this.field.relationModel);
            const f = (0, spec_1.reverseField)(dao.spec, this.spec, this.field);
            if (f) {
                return dao.getByField(f.name, this.id);
            }
        }
        return [];
    }
}
exports.default = ReverseAccess;
