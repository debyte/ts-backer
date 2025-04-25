"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.first = first;
exports.concat = concat;
exports.lined = lined;
exports.spaced = spaced;
exports.commas = commas;
exports.commasLined = commasLined;
function first(array) {
    return array.length > 0 ? array[0] : undefined;
}
function concat(sep, parts) {
    return parts.filter(p => !!p).join(sep);
}
function lined(...lines) {
    return concat("\n", lines);
}
function spaced(...parts) {
    return concat(" ", parts);
}
function commas(...parts) {
    return concat(", ", parts);
}
function commasLined(...parts) {
    return concat(",\n", parts);
}
