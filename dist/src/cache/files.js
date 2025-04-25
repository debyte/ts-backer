"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPath = toPath;
exports.loadSpec = loadSpec;
exports.writeSpec = writeSpec;
exports.isFileMissing = isFileMissing;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const errors_1 = require("../errors");
function toPath(configured, name) {
    return configured.replace("${name}", name);
}
function loadSpec(path) {
    const data = JSON.parse((0, node_fs_1.readFileSync)(path, "utf8"));
    if (isEntitySpec(data)) {
        return data;
    }
    throw new errors_1.CacheError(`Cache file "${path}" has unexpected content for an entity specification.`);
}
function writeSpec(path, spec) {
    const dir = (0, node_path_1.dirname)(path);
    if (!(0, node_fs_1.existsSync)(dir)) {
        (0, node_fs_1.mkdirSync)(dir);
    }
    (0, node_fs_1.writeFileSync)(path, JSON.stringify(spec, undefined, 2));
}
function isFileMissing(err) {
    return (err !== null
        && typeof err === "object"
        && "code" in err
        && err.code === "ENOENT");
}
function isEntitySpec(o) {
    return (typeof o === "object" && o !== null
        && "time" in o && typeof o.time === "number");
}
