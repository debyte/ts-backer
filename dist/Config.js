"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engine = void 0;
const constants_1 = require("./constants");
const ConfigEngine_1 = __importDefault(require("./util/ConfigEngine"));
const root = process.env.NODE_ENV === "test" ? "tests" : "src";
const ConfigTyping = {
    TSCONFIG_PATH: "tsconfig.json",
    MODEL_FILE_PATTERN: root + "/model/${name}.ts",
    CACHE_FILE_PATTERN: root + "/model/.cache/${name}.json",
};
exports.engine = new ConfigEngine_1.default(constants_1.PACKAGE, ConfigTyping);
exports.engine.read();
const Config = exports.engine.store;
exports.default = Config;
