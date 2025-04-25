"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDao = void 0;
const src_1 = require("../../src");
exports.userDao = (0, src_1.register)("User")
    .index("name", "email")
    .dao();
