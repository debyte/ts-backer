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
        const files = (0, files_1.findMatchingFiles)(Config_1.default.CACHE_FILE_PATTERN);
        this.names = files.map(({ name }) => name);
        this.specCache = Object.fromEntries(files.map(f => [f.name, (0, files_1.loadSpec)(f.path)]));
        this.daoCache = {};
    }
    listAvailableModels() {
        return this.names;
    }
    get(name, maker) {
        if (name in this.daoCache) {
            return new DaoBuilder_1.default(this.daoCache[name]);
        }
        if (name in this.specCache) {
            const dao = maker(this.specCache[name]);
            this.daoCache[name] = dao;
            return new DaoBuilder_1.default(dao);
        }
        const path = (0, files_1.toPath)(Config_1.default.CACHE_FILE_PATTERN, name);
        throw new errors_1.CacheError(`Required cache file "${path}" is missing in production env.`
            + " It should be generated automatically when developing with "
            + ` ${constants_1.PACKAGE} or by running: ${constants_1.PACKAGE} analyse`);
    }
    peek(name) {
        if (name in this.daoCache) {
            return this.daoCache[name];
        }
        throw new errors_1.CacheError("Peeked uncached dao by name: " + name);
    }
}
exports.default = ProdModelCache;
