"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyseModelFile = analyseModelFile;
const ts_morph_1 = require("ts-morph");
const Config_1 = __importDefault(require("../Config"));
const EntityFieldSpec_1 = require("../spec/EntityFieldSpec");
const code_1 = require("./code");
const ModelErrorFactory_1 = __importDefault(require("./ModelErrorFactory"));
const ModelTraverser_1 = __importDefault(require("./ModelTraverser"));
function analyseModelFile(name, path, modified) {
    // TODO, remove or log properly
    console.log(`Analysing model "${name}" at "${path}".`);
    const spec = {
        name,
        path,
        fields: [],
        indexes: [],
        time: modified,
    };
    const error = new ModelErrorFactory_1.default(name, path);
    // Parse model source code
    const project = new ts_morph_1.Project({ tsConfigFilePath: Config_1.default.TSCONFIG_PATH });
    const src = project.getSourceFile(path);
    if (src === undefined) {
        throw error.get("Failed to load typescript module from ${path} while expecting a model", "file that contains an entity interface and registration for ${name}");
    }
    const { entity, register } = ModelTraverser_1.default.run(name, error, src);
    // Collect inherited and locally declared entity properties.
    const props = [];
    for (const b of entity.getBaseDeclarations().reverse()) {
        if (b instanceof ts_morph_1.InterfaceDeclaration) {
            props.push(...b.getProperties());
        }
        else if (b instanceof ts_morph_1.TypeAliasDeclaration) {
            const bi = b.getParentIfKind(ts_morph_1.SyntaxKind.InterfaceDeclaration);
            if (bi) {
                props.push(...bi.getProperties());
            }
        }
    }
    props.push(...entity.getProperties());
    // Parse entity properties into field specifications
    for (const p of props) {
        const r = parseType(error, p.getName(), p.getType(), p.getTypeNode());
        spec.fields.push(r.field);
        if (r.index) {
            spec.indexes.push(r.index);
        }
    }
    // Parse register call chain for entity configurations
    let daoReached = false;
    let p = (0, code_1.getPropertyCall)(register);
    while (p) {
        const r = parseConfigCall(error, p.name, p.call);
        if (r.index) {
            spec.indexes.push(r.index);
        }
        if (r.field) {
            const n = r.field.name;
            const f = spec.fields.find(f => f.name === n);
            if (f) {
                f.onAdd = r.field.onAdd;
                f.onAddValue = r.field.onAddValue;
            }
        }
        if (r.dao) {
            daoReached = true;
            p = undefined;
        }
        else {
            p = (0, code_1.getPropertyCall)(p.call);
        }
    }
    if (!daoReached) {
        throw error.get("${modelMust} register the entity and configure a dao in one chain,", "${registerSample}");
    }
    return spec;
}
function parseType(error, name, type, node) {
    if (node?.isKind(ts_morph_1.SyntaxKind.TypeReference)) {
        return parseTypeReference(error, name, type, node.asKindOrThrow(ts_morph_1.SyntaxKind.TypeReference));
    }
    const base = { name, nullable: type.isNullable() };
    switch (node?.getKind()) {
        case ts_morph_1.SyntaxKind.StringKeyword:
            return { field: { ...base, type: "string" } };
        case ts_morph_1.SyntaxKind.BooleanKeyword:
            return { field: { ...base, type: "boolean" } };
        case ts_morph_1.SyntaxKind.NumberKeyword:
            return { field: { ...base, type: "number" } };
    }
    throw error.get("${model} declares unsupported property type:", node?.getFullText() || "(missing)");
}
function parseTypeReference(error, name, type, node) {
    const base = { name, nullable: type.isNullable() };
    const tn = node.getTypeName().getText();
    const ta = (0, code_1.getSingleTypeArgument)(node);
    if (ta) {
        if (tn === "Indexed" || tn === "Unique") {
            return {
                index: { fields: [name], unique: tn === "Unique" },
                ...parseType(error, name, type.getApparentType(), ta),
            };
        }
        else if (tn === "Json") {
            return { field: { ...base, type: "json" } };
        }
        const tra = ta.asKind(ts_morph_1.SyntaxKind.TypeReference);
        if (tra) {
            const rbase = {
                ...base,
                type: "id",
                relationModel: tra.getTypeName().getText(),
            };
            switch (tn) {
                case "OneToOne":
                    return {
                        index: { fields: [name], unique: true },
                        field: { ...rbase, relationType: "oneToOne" },
                    };
                case "ManyToOne":
                    return {
                        index: { fields: [name], unique: false },
                        field: { ...rbase, relationType: "manyToOne" },
                    };
                case "OneToOneReverse":
                    return { field: { ...rbase, relationType: "oneToOneReverse" } };
                case "ManyToOneReverse":
                    return { field: { ...rbase, relationType: "manyToOneReverse" } };
            }
        }
    }
    else if (type.isBoolean()) {
        return { field: { ...base, type: "boolean" } };
    }
    else if (type.isNumber()) {
        return { field: { ...base, type: "number" } };
    }
    else if (type.isString()) {
        return { field: { ...base, type: "string" } };
    }
    else if (type.getApparentType().getText() === "Date") {
        return { field: { ...base, type: "timestamp" } };
    }
    throw error.get("${model} declares unsupported property type:", node.getFullText());
}
function parseConfigCall(error, name, call) {
    if (name === "index" || name === "uniqueIndex") {
        if (call.getArguments().length === 0) {
            throw error.get("${model} declares an index without any field names");
        }
        return {
            index: {
                fields: (0, code_1.getStringArguments)(call),
                unique: name === "uniqueIndex",
            }
        };
    }
    else if (name === "onFieldAdd") {
        const args = (0, code_1.getStringArguments)(call);
        if (args.length > 1 && (0, EntityFieldSpec_1.isOnAddType)(args[1])) {
            return {
                field: {
                    name: args[0],
                    onAdd: args[1],
                    onAddValue: args[2],
                }
            };
        }
        throw error.get("${model} has unexpected arguments for \"onFieldAdd\"");
    }
    else if (name === "dao") {
        return { dao: true };
    }
    throw error.get("${model} register chain has unrecognized method:", name);
}
