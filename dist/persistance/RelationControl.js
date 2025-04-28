"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../cache");
const Relation_1 = __importDefault(require("../Relation"));
class RelationControl extends Relation_1.default {
    constructor(field, id) {
        super(id);
        this.field = field;
    }
    async get() {
        if (this.id !== undefined) {
            return cache_1.cache.peek(this.field.relationModel).get(this.id);
        }
        return undefined;
    }
    set(related) {
        this.id = related.id;
    }
    unset() {
        this.id = undefined;
    }
}
exports.default = RelationControl;
