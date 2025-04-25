"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelError = exports.CacheError = exports.RelationAccessError = exports.GeneralError = void 0;
const constants_1 = require("./constants");
class GeneralError extends Error {
    constructor(message) {
        super(message);
        this.name = `${constants_1.PACKAGE}-error`;
    }
}
exports.GeneralError = GeneralError;
class RelationAccessError extends GeneralError {
    constructor() {
        super("Entity must be created or updated before using relation controls");
        this.name = `${constants_1.PACKAGE}-relation-error`;
    }
}
exports.RelationAccessError = RelationAccessError;
class CacheError extends GeneralError {
    constructor(message) {
        super(message);
        this.name = `${constants_1.PACKAGE}-cache-error`;
    }
}
exports.CacheError = CacheError;
class ModelError extends GeneralError {
    constructor(message, path) {
        super(message);
        this.name = `${constants_1.PACKAGE}-model-error`;
        this.model = path;
    }
}
exports.ModelError = ModelError;
