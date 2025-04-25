"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Offers clear and typed methods to refine entity specification beyond that
 * in the model interface. Finally, gets the entity DAO. The specification
 * methods have no effect when run but are read in the entity analysis before.
 */
class DaoBuilder {
    constructor(dao) {
        this.impl = dao;
    }
    dao() {
        return this.impl;
    }
    index(..._fields) {
        return this;
    }
    uniqueIndex(..._fields) {
        return this;
    }
    onFieldAdd(_field, _type, _columnNameOrSqlExpression) {
        return this;
    }
}
exports.default = DaoBuilder;
