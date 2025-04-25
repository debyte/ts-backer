"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const spec_1 = require("../spec");
const arrays_1 = require("../util/arrays");
const migrate_1 = require("./migrate");
const RelationControl_1 = __importDefault(require("./RelationControl"));
const ReverseAccess_1 = __importDefault(require("./ReverseAccess"));
class Dao {
    constructor(spec) {
        this.spec = spec;
        this.time = spec.time;
        this.table = spec.name;
        this.initFlag = false;
    }
    async get(id) {
        return this.getOneByField("id", id);
    }
    async getAll(limit, offset) {
        return this.select((0, _1.sql) `
      select * from ${(0, _1.sql)(this.table)}
        order by id
        limit ${limit || constants_1.DEFAULT_ALL_LIMIT} offset ${offset || 0}
    `);
    }
    async getByField(name, value) {
        return this.select((0, _1.sql) `
      select * from ${(0, _1.sql)(this.table)}
        where ${(0, _1.sql)(name)} = ${value}
        order by created
    `);
    }
    async getOneByField(name, value) {
        return (0, arrays_1.first)(await this.getByField(name, value));
    }
    async create(entity) {
        const res = await this.select((0, _1.sql) `
      insert into ${(0, _1.sql)(this.table)} ${(0, _1.sql)(this.entityToDb(entity))}
        returning *
    `);
        if (res.length !== 1) {
            throw new errors_1.GeneralError("Insert unexpectedly returned no rows");
        }
        return res[0];
    }
    async save(entity) {
        await this.query((0, _1.sql) `
      update ${(0, _1.sql)(this.table)} set ${(0, _1.sql)(this.entityToDb(entity))}
        where id = ${entity.id}
    `);
    }
    async delete(id) {
        await this.query((0, _1.sql) `
      delete from ${(0, _1.sql)(this.table)} where id = ${id}
    `);
    }
    async deleteAll() {
        await this.query((0, _1.sql) `
      delete from ${(0, _1.sql)(this.table)}
    `);
    }
    async select(query) {
        await this.init();
        return (await query).map(r => this.dbToEntity(r));
    }
    async query(query) {
        await this.init();
        await query;
    }
    async init() {
        if (this.initFlag) {
            return;
        }
        await (0, migrate_1.migrate)(this.spec);
        this.initFlag = true;
    }
    dbToEntity(row) {
        const e = {};
        const id = row["id"];
        for (const f of this.spec.fields) {
            e[f.name] = this.dbToField(f, row[f.name], id);
        }
        return e;
    }
    dbToField(f, val, eid) {
        if ((0, spec_1.isRelation)(f)) {
            switch (f.relationType) {
                case "oneToOne":
                case "manyToOne":
                    return new RelationControl_1.default(f, val);
                case "oneToOneReverse":
                case "manyToOneReverse":
                    return new ReverseAccess_1.default(this.spec, f, eid);
            }
        }
        return val;
    }
    entityToDb(entity) {
        const e = entity;
        const r = {};
        for (const f of (0, spec_1.storedFields)(this.spec.fields)) {
            const v = this.fieldToDb(f, e[f.name]);
            if (v !== undefined) {
                r[f.name] = v;
            }
        }
        return r;
    }
    fieldToDb(f, val) {
        if (f.name === "id" || f.name === "created") {
            return undefined;
        }
        if ((0, spec_1.isRelation)(f) && val) {
            return val.id;
        }
        return val;
    }
}
exports.default = Dao;
