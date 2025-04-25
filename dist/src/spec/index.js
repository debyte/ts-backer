"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRelation = isRelation;
exports.storedFields = storedFields;
exports.valueFields = valueFields;
exports.relationFields = relationFields;
exports.reverseField = reverseField;
function isRelation(f) {
    return f.relationModel !== undefined && f.relationType !== undefined;
}
function storedFields(fields) {
    return fields.filter(f => f.relationType === undefined || !f.relationType.endsWith("Reverse"));
}
function valueFields(fields) {
    return fields.filter(f => f.relationModel === undefined);
}
function relationFields(fields) {
    return fields.filter(f => f.relationModel !== undefined);
}
function reverseField(source, target, field) {
    const t = getReverseType(field.relationType);
    return source.fields.find(f => f.relationModel === target.name && f.relationType === t);
}
function getReverseType(t) {
    switch (t) {
        case "oneToOneReverse":
            return "oneToOne";
        case "manyToOneReverse":
            return "manyToOne";
    }
    return undefined;
}
