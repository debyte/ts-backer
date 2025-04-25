"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const errors_1 = require("../errors");
class ModelErrorFactory {
    constructor(name, path) {
        this.name = name;
        this.path = path;
    }
    get(...msg) {
        return new errors_1.ModelError(msg.join(" ").replaceAll(/\${(\w+)}/g, (_, n) => this.arg(n)), this.path);
    }
    arg(name) {
        switch (name) {
            case "name":
                return `'${this.name}'`;
            case "path":
                return `"${this.path}"`;
            case "pkg":
                return constants_1.PACKAGE;
            case "model":
                return `Model file "${this.path}"`;
            case "modelMust":
                return `Model file "${this.path}" must`;
            case "interfaceSample":
                return `i.e. export interface ${this.name} extends Entity {...}`;
            case "registerSample":
                return `i.e. export const ${this.name}Dao =`
                    + ` register<${this.name}>("${this.name}").dao()`;
        }
        return "UNKNOWN_ERROR_ARGUMENT_NAME";
    }
}
exports.default = ModelErrorFactory;
