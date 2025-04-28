"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPath = toPath;
exports.loadSpec = loadSpec;
exports.writeSpec = writeSpec;
exports.isFileMissing = isFileMissing;
exports.findMatchingFiles = findMatchingFiles;
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
    (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(path), { recursive: true });
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
function findMatchingFiles(configured) {
    const paths = [];
    const re = new RegExp("^" + configured.replace("${name}", "(\\w+)") + "$");
    const i = configured.indexOf("${name}");
    const dir = (0, node_path_1.dirname)(configured.slice(0, i) + "foo");
    for (const f of (0, node_fs_1.readdirSync)(dir, { recursive: true })) {
        const path = (0, node_path_1.join)(dir, f);
        const match = path.match(re);
        if (match && match[1]) {
            paths.push({ path, name: match[1] });
        }
    }
    return paths;
}
