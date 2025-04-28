"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dao = void 0;
exports.register = register;
exports.registerUsingDao = registerUsingDao;
exports.relation = relation;
exports.reverse = reverse;
exports.end = end;
__exportStar(require("./errors"), exports);
__exportStar(require("./fields"), exports);
var Dao_1 = require("./persistance/Dao");
Object.defineProperty(exports, "Dao", { enumerable: true, get: function () { return __importDefault(Dao_1).default; } });
const cache_1 = require("./cache");
const persistance_1 = require("./persistance");
const Dao_2 = __importDefault(require("./persistance/Dao"));
const Relation_1 = __importDefault(require("./Relation"));
const Reverse_1 = __importDefault(require("./Reverse"));
/**
 * Registers an entity to the persistance system and produces a DAO.
 * The entity is specified using properties in a typed interface
 * and the specification builder methods when necessary. The interface
 * declaration and the register call MUST be placed in a model file
 * that adheres to the model path pattern.
 *
 * @param name the entity name (= file name without file extension)
 * @returns a specification builder that finally produces the DAO
 */
function register(name) {
    return cache_1.cache.get(name, spec => new Dao_2.default(spec));
}
/**
 * Registers an entity to the persistance system and produces a custom
 * DAO using the provided constructor. The entity is specified using
 * properties in a typed interface and the specification builder methods
 * when necessary. The interface declaration and the register call MUST
 * be placed in a model file that adheres to the model path pattern.
 *
 * @param name the entity name (= file name without file extension)
 * @param maker a custom dao maker
 * @returns a specification builder that finally produces the DAO
 */
function registerUsingDao(name, maker) {
    return cache_1.cache.get(name, maker);
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
 * Ends system resources, i.e. after automated unit tests.
 */
async function end() {
    await persistance_1.sql.end();
}
