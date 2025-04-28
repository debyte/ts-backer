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
const Config_1 = __importStar(require("./Config"));
const analyse_1 = require("./analyse");
const files_1 = require("./cache/files");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const arrays_1 = require("./util/arrays");
const migrate_1 = require("./persistance/migrate");
function usage() {
    console.log((0, arrays_1.lined)(`${constants_1.PACKAGE}: Automated backend API based on model classes`, "  help     -  Shows this usage.", "  config   -  Creates a configuration file with default values.", "  analyse  -  Analyses model classes, writes cache files, and migrates", "              databases. In development, analysis are automatically", "              triggered on changing a model file."));
}
function config() {
    const path = Config_1.engine.write();
    console.log("Wrote configuration to: " + path);
    process.exit(0);
}
async function analyse() {
    for (const { path, name } of (0, files_1.findMatchingFiles)(Config_1.default.MODEL_FILE_PATTERN)) {
        const stat = (0, node_fs_1.statSync)(path);
        try {
            const spec = (0, analyse_1.analyseModelFile)(name, path, stat.mtime.getTime());
            (0, files_1.writeSpec)((0, files_1.toPath)(Config_1.default.CACHE_FILE_PATTERN, name), spec);
            await (0, migrate_1.migrate)(spec);
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
    process.exit(0);
}
const arg = process.argv;
const helpFlag = ["help", "--help", "-h"].some(a => arg.includes(a));
if (!helpFlag) {
    if (arg.includes("config")) {
        config();
    }
    if (arg.includes("analyse")) {
        analyse();
    }
}
usage();
