#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const Config_1 = __importStar(require("./Config"));
const analyse_1 = require("./analyse");
const files_1 = require("./cache/files");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
function Usage() {
    console.log([
        `${constants_1.PACKAGE}: Automated backend API based on model classes`,
        "  help     -  Shows this usage.",
        "  config   -  Creates a configuration file with default values.",
        "  analyse  -  Analyses model classes and writes cache files.",
        "              In development, analysis are automatic on model change."
    ].join("\n"));
}
const arg = process.argv;
const helpFlag = ["help", "--help", "-h"].some(a => arg.includes(a));
// Create configuration
if (!helpFlag && arg.includes("config")) {
    const path = Config_1.engine.write();
    console.log("Wrote configuration to: " + path);
    process.exit(0);
}
// Analyse all model classes
if (!helpFlag && arg.includes("analyse")) {
    const re = new RegExp("^" + Config_1.default.MODEL_FILE_PATTERN.replace("${name}", "(\\w+)") + "$");
    const i = Config_1.default.MODEL_FILE_PATTERN.indexOf("${name}");
    const dir = (0, node_path_1.dirname)(Config_1.default.MODEL_FILE_PATTERN.slice(0, i) + "foo");
    for (const f of (0, node_fs_1.readdirSync)(dir, { recursive: true })) {
        const path = (0, node_path_1.join)(dir, f);
        const match = path.match(re);
        if (match && match[1]) {
            const name = match[1];
            const stat = (0, node_fs_1.statSync)(path);
            try {
                const spec = (0, analyse_1.analyseModelFile)(name, path, stat.mtime.getTime());
                (0, files_1.writeSpec)((0, files_1.toPath)(Config_1.default.CACHE_FILE_PATTERN, name), spec);
            }
            catch (e) {
                if (e instanceof errors_1.ModelError) {
                    console.log(`ERROR in model file: ${path}\n* ${e.message}`);
                }
                else {
                    throw e;
                }
            }
        }
    }
    process.exit(0);
}
Usage();
