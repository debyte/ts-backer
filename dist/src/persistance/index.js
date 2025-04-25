"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
const postgres_1 = __importDefault(require("postgres"));
const process_1 = require("process");
const constants_1 = require("../constants");
exports.sql = (0, postgres_1.default)({
    host: process_1.env[constants_1.ENV_VARS.host],
    port: asNumber(constants_1.ENV_VARS.port),
    database: process_1.env[constants_1.ENV_VARS.database],
    user: process_1.env[constants_1.ENV_VARS.user],
    username: process_1.env[constants_1.ENV_VARS.username],
    password: process_1.env[constants_1.ENV_VARS.password],
    idle_timeout: asNumber(constants_1.ENV_VARS.idle_timeout),
    connect_timeout: asNumber(constants_1.ENV_VARS.connect_timeout),
    ssl: isFalsy(constants_1.ENV_VARS.ssl_auth) ? { rejectUnauthorized: false } : undefined,
});
function asNumber(key) {
    return process_1.env[key] !== undefined ? Number(process_1.env[key]) : undefined;
}
function isFalsy(key) {
    return process_1.env[key] !== undefined
        && constants_1.FALSY_STRINGS.indexOf(process_1.env[key].toLowerCase()) >= 0;
}
