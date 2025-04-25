"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInProject = isInProject;
exports.isProjectId = isProjectId;
exports.getPropertyCall = getPropertyCall;
exports.getStringArguments = getStringArguments;
exports.getSingleTypeArgument = getSingleTypeArgument;
const ts_morph_1 = require("ts-morph");
const constants_1 = require("../constants");
function isInProject(n) {
    return n.getSourceFile().getFilePath().includes(`${constants_1.PACKAGE}/`);
}
function isProjectId(n, name) {
    if (n && n.isKind(ts_morph_1.SyntaxKind.Identifier) && n.getText() === name) {
        const d = n.getDefinitionNodes();
        return d.length > 0 && isInProject(d.slice(-1)[0]);
    }
    return false;
}
function getPropertyCall(n) {
    const pa = n.getParentIfKind(ts_morph_1.SyntaxKind.PropertyAccessExpression);
    if (pa && pa.getExpression() === n) {
        const call = pa.getParentIfKind(ts_morph_1.SyntaxKind.CallExpression);
        if (call && call.getExpression() === pa) {
            return {
                name: pa.getName(),
                call,
            };
        }
    }
    return undefined;
}
function getStringArguments(call) {
    return call.getArguments().map(a => a.asKindOrThrow(ts_morph_1.SyntaxKind.StringLiteral).getLiteralText());
}
function getSingleTypeArgument(node) {
    const arg = node.getTypeArguments();
    return arg.length === 1 ? arg[0] : undefined;
}
