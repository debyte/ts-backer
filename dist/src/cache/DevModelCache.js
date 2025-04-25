"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const Config_1 = __importDefault(require("../Config"));
const analyse_1 = require("../analyse");
const DaoBuilder_1 = __importDefault(require("../DaoBuilder"));
const errors_1 = require("../errors");
const files_1 = require("./files");
class DevModelCache {
    constructor() {
        this.cache = {};
    }
    get(name, maker) {
        // Get entity modification time
        const path = (0, files_1.toPath)(Config_1.default.MODEL_FILE_PATTERN, name);
        const modified = this.getModified(path);
        // Try in-class cache
        const cached = this.cache[name];
        if (cached !== undefined && cached.time === modified) {
            return new DaoBuilder_1.default(cached);
        }
        // Try cached specification
        const cachePath = (0, files_1.toPath)(Config_1.default.CACHE_FILE_PATTERN, name);
        const spec = this.getCached(cachePath);
        if (spec !== undefined && spec.time === modified) {
            const dao = maker(spec);
            this.cache[name] = dao;
            return new DaoBuilder_1.default(dao);
        }
        // Analyse new or modified entities
        const newSpec = (0, analyse_1.analyseModelFile)(name, path, modified);
        (0, files_1.writeSpec)(cachePath, newSpec);
        const dao = maker(newSpec);
        this.cache[name] = dao;
        return new DaoBuilder_1.default(dao);
    }
    peek(name) {
        if (name in this.cache) {
            return this.cache[name];
        }
        throw new errors_1.CacheError("Peeked uncached dao by name: " + name);
    }
    getModified(path) {
        try {
            return (0, node_fs_1.statSync)(path).mtime.getTime();
        }
        catch (err) {
            if ((0, files_1.isFileMissing)(err)) {
                throw new errors_1.ModelError(`Failed to find model declaration file "${path}", which is`
                    + " constructed from the name argument of the register call and the"
                    + " configured MODEL_FILE_PATTERN", path);
            }
            throw err;
        }
    }
    getCached(path) {
        try {
            return (0, files_1.loadSpec)(path);
        }
        catch (err) {
            if ((0, files_1.isFileMissing)(err)) {
                return undefined;
            }
            throw err;
        }
    }
}
exports.default = DevModelCache;
