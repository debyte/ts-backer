"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
exports.listAvailable = listAvailable;
exports.getGenericDao = getGenericDao;
const __1 = require("..");
const DevModelCache_1 = __importDefault(require("./DevModelCache"));
const ProdModelCache_1 = __importDefault(require("./ProdModelCache"));
exports.cache = process.env.NODE_ENV === "production"
    ? new ProdModelCache_1.default()
    : new DevModelCache_1.default();
function listAvailable() {
    return exports.cache.list();
}
function getGenericDao(name) {
    return exports.cache.get(name, spec => new __1.Dao(spec)).dao();
}
