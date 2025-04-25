"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOnAddType = isOnAddType;
function isOnAddType(t) {
    return ["delete_old_rows", "set_old_rows", "rename"].includes(t);
}
