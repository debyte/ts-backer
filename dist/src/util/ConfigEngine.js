"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const node_fs_1 = require("node:fs");
const DEFAULT_EXTENSION = "mjs";
class ConfigEngine {
    constructor(name, typing) {
        this.name = name;
        this.store = { ...typing };
    }
    read() {
        this.store = this.loadFirstExisting([
            [["mjs"], (path) => {
                    const p = (0, node_path_1.resolve)(path);
                    return eval(`import("${p}").then(m => m.default);`);
                }],
            [["cjs", "js"], (path) => {
                    const p = (0, node_path_1.resolve)(path);
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    return require(p);
                }],
            [["json"], (path) => {
                    return JSON.parse((0, node_fs_1.readFileSync)(path, "utf8"));
                }],
        ]);
    }
    loadFirstExisting(attempts) {
        for (const [extensions, loader] of attempts) {
            for (const ext of extensions) {
                const path = this.makePath(ext);
                try {
                    (0, node_fs_1.statSync)(path);
                    const values = loader(path);
                    this.path = path;
                    return { ...this.store, ...values };
                }
                catch (_err) {
                    // Ignore
                }
            }
        }
        return this.store;
    }
    makePath(extension) {
        return (0, node_path_1.join)(".", `${this.name}.config.${extension}`);
    }
    write() {
        if (this.path === undefined) {
            this.path = this.makePath(DEFAULT_EXTENSION);
        }
        const json = JSON.stringify(this.store, null, 2);
        if (this.path.endsWith(".mjs")) {
            (0, node_fs_1.writeFileSync)(this.path, `const config = ${json};\n\nexport default config;\n`);
        }
        else if (this.path.endsWith(".cjs") || this.path.endsWith(".js")) {
            (0, node_fs_1.writeFileSync)(this.path, `module.exports = ${json};\n`);
        }
        else if (this.path.endsWith(".json")) {
            (0, node_fs_1.writeFileSync)(this.path, `${json}\n`);
        }
        else {
            throw new Error("Configuration has unknown extension: " + this.path);
        }
        return this.path;
    }
    remove() {
        if (this.path !== undefined) {
            (0, node_fs_1.unlinkSync)(this.path);
        }
    }
}
exports.default = ConfigEngine;
