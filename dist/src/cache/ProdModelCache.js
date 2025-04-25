"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = __importDefault(require("../Config"));
const constants_1 = require("../constants");
const DaoBuilder_1 = __importDefault(require("../DaoBuilder"));
const errors_1 = require("../errors");
const files_1 = require("./files");
class ProdModelCache {
    constructor() {
        this.cache = {};
    }
    get(name, maker) {
        const dao = this.cache[name];
        if (dao !== undefined) {
            return new DaoBuilder_1.default(dao);
        }
        // Lazy load entity specifications
        const path = (0, files_1.toPath)(Config_1.default.CACHE_FILE_PATTERN, name);
        const lazyDao = maker(this.getCached(path));
        this.cache[name] = lazyDao;
        return new DaoBuilder_1.default(lazyDao);
    }
    getCached(path) {
        try {
            return (0, files_1.loadSpec)(path);
        }
        catch (err) {
            if ((0, files_1.isFileMissing)(err)) {
                throw new errors_1.CacheError(`Required cache file "${path}" is missing in production env.`
                    + " It should be generated automatically when developing with "
                    + ` ${constants_1.PACKAGE} or by running: ${constants_1.PACKAGE} analyse`);
            }
            throw err;
        }
    }
    peek(name) {
        if (name in this.cache) {
            return this.cache[name];
        }
        throw new errors_1.CacheError("Peeked uncached dao by name: " + name);
    }
}
exports.default = ProdModelCache;
