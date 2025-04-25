"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const code_1 = require("./code");
const GenericTraverser_1 = __importDefault(require("./GenericTraverser"));
class ModelTraverser extends GenericTraverser_1.default {
    static run(name, error, node) {
        const tr = new ModelTraverser(name, error);
        tr.traverse(node);
        if (tr.entity === undefined) {
            throw error.get("${modelMust} declare entity interface ${name}, ${interfaceSample}");
        }
        if (tr.register === undefined) {
            throw error.get("${modelMust} '${pkg}.register' the entity interface, ${registerSample}");
        }
        return { entity: tr.entity, register: tr.register };
    }
    constructor(name, error) {
        super();
        this.name = name;
        this.error = error;
        this.visitors.set(ts_morph_1.SyntaxKind.InterfaceDeclaration, n => this.handleInterface(n.asKindOrThrow(ts_morph_1.SyntaxKind.InterfaceDeclaration)));
        this.visitors.set(ts_morph_1.SyntaxKind.CallExpression, n => this.handleCall(n.asKindOrThrow(ts_morph_1.SyntaxKind.CallExpression)));
    }
    handleInterface(itf) {
        if (itf.getName() === this.name) {
            // Must extend Entity
            const ext = itf.getBaseDeclarations();
            const b = ext.length > 0 ? ext.slice(-1)[0] : undefined;
            if (!b || b.getName() !== "Entity" || !(0, code_1.isInProject)(b)) {
                throw this.error.get("${modelMust} declare an interface that extends '${pkg}/Entity',", "${interfaceSample}");
            }
            // Only declare once
            if (this.entity !== undefined) {
                throw this.error.get("${modelMust} declare a single model interface");
            }
            this.entity = itf;
        }
        return true;
    }
    handleCall(call) {
        if ((0, code_1.isProjectId)(call.getFirstChild(), "register")) {
            // Must register with correct name and interface
            const targ = call.getTypeArguments();
            if (targ.length !== 1
                || !targ[0].isKind(ts_morph_1.SyntaxKind.TypeReference)
                || targ[0].getText() !== this.name) {
                throw this.error.get("${modelMust} register using type argument ${name}, ${registerSample}");
            }
            const arg = call.getArguments();
            if (arg.length !== 1
                || !arg[0].isKind(ts_morph_1.SyntaxKind.StringLiteral)
                || arg[0].getText() !== `"${this.name}"`) {
                throw this.error.get("${modelMust} register using name ${name}, ${registerSample}");
            }
            // Only register once
            if (this.register !== undefined) {
                throw this.error.get("${modelMust} register the declared entity once");
            }
            this.register = call;
        }
        return true;
    }
}
exports.default = ModelTraverser;
