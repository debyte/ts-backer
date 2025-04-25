"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ALL_LIMIT = exports.FALSY_STRINGS = exports.ENV_VARS = exports.PACKAGE = void 0;
exports.PACKAGE = "ts-backer";
exports.ENV_VARS = {
    host: "PGHOST",
    port: "PGPORT",
    database: "PGDATABASE",
    user: "PGUSER",
    username: "PGUSERNAME",
    password: "PGPASSWORD",
    idle_timeout: "PGIDLE_TIMEOUT",
    connect_timeout: "PGCONNECT_TIMEOUT",
    ssl_auth: "PGSSL_AUTH",
};
exports.FALSY_STRINGS = ["no", "false", "off"];
exports.DEFAULT_ALL_LIMIT = 100000;
