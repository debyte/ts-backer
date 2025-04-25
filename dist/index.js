"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE = void 0;
exports.register = register;
exports.registerUsingDao = registerUsingDao;
exports.relation = relation;
exports.reverse = reverse;
exports.peek = peek;
exports.end = end;
const DevModelCache_1 = __importDefault(require("./cache/DevModelCache"));
const ProdModelCache_1 = __importDefault(require("./cache/ProdModelCache"));
const persistance_1 = require("./persistance");
const Dao_1 = __importDefault(require("./persistance/Dao"));
const Relation_1 = __importDefault(require("./Relation"));
const Reverse_1 = __importDefault(require("./Reverse"));
exports.CACHE = process.env.NODE_ENV === "production"
    ? new ProdModelCache_1.default() : new DevModelCache_1.default();
/**
 * Registers an entity to the persistance system and produces a DAO.
 * The entity is specified using properties in a typed interface
 * and the specification builder methods when necessary. The interface
 * declaration and the register call MUST be placed in a model file
 * that adheres to the model path pattern.
 *
 * @param name the model file name without file extension
 * @returns a specification builder that finally produces the DAO
 */
function register(name) {
    return exports.CACHE.get(name, spec => new Dao_1.default(spec));
}
/**
 * Registers an entity to the persistance system and produces a custom
 * DAO using the provided constructor. The entity is specified using
 * properties in a typed interface and the specification builder methods
 * when necessary. The interface declaration and the register call MUST
 * be placed in a model file that adheres to the model path pattern.
 *
 * @param name the model file name without file extension
 * @param maker a custom dao maker
 * @returns a specification builder that finally produces the DAO
 */
function registerUsingDao(name, maker) {
    return exports.CACHE.get(name, maker);
}
/**
 * Creates a relation for entity creation.
 * @param related the related entity
 * @returns relation placeholder
 */
function relation(related) {
    return new Relation_1.default(related);
}
/**
 * Creates a reverse relation placeholder for entity creation.
 * @returns reverse relation placeholder
 */
function reverse() {
    return new Reverse_1.default();
}
/**
 * Accesses cached dao if one exists (for system internal use).
 */
function peek(name) {
    return exports.CACHE.peek(name);
}
/**
 * Ends system resources, i.e. after automated unit tests.
 */
async function end() {
    await persistance_1.sql.end();
}
