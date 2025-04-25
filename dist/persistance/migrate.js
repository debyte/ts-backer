"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = migrate;
const _1 = require(".");
const ModelErrorFactory_1 = __importDefault(require("../analyse/ModelErrorFactory"));
const spec_1 = require("../spec");
const arrays_1 = require("../util/arrays");
const TYPES = {
    id: "bigint",
    string: "text",
    number: "double precision",
    boolean: "boolean",
    timestamp: "timestamp without time zone",
    json: "jsonb",
};
async function migrate(spec) {
    const script = [];
    const ef = new ModelErrorFactory_1.default(spec.name, spec.path);
    if (!await tableExists(spec)) {
        // Create table and indexes
        script.push(createTable(spec));
        for (const s of spec.indexes) {
            if (s.unique) {
                script.push(createConstraint(spec, s));
            }
            else {
                script.push(createIndex(spec, s));
            }
        }
    }
    else {
        // Alter columns
        const sqlColumns = await getTableColumns(spec);
        const doneColumns = {};
        for (const s of (0, spec_1.storedFields)(spec.fields)) {
            doneColumns[s.name] = true;
            const c = sqlColumns.find(c => c.name === s.name);
            if (!c) {
                if (s.onAdd === "rename") {
                    const c = sqlColumns.find(c => c.name === s.onAddValue);
                    if (!c) {
                        throw ef.get("${model} has an unknown field name in \"rename\"");
                    }
                    doneColumns[s.name] = true;
                    script.push(renameColumn(spec, s, c), ...alterColumn(spec, s, c, ef));
                }
                else {
                    script.push(addColumn(spec, { ...s, nullable: true }));
                    if (!s.nullable) {
                        script.push(...alterColumnNotNull(spec, s, ef));
                    }
                }
            }
            else if (s.name !== "id" && s.name !== "created") {
                script.push(...alterColumn(spec, s, c, ef));
            }
        }
        // Manage indexes
        const sqlIndexes = await getTableIndexes(spec);
        const sqlConstraints = await getTableConstraints(spec);
        const doneIndexes = {};
        const doneConstraints = {};
        for (const s of spec.indexes) {
            const name = indexName(spec, s.fields);
            doneIndexes[name] = true;
            doneConstraints[name] = true;
            const i = sqlIndexes.find(i => i.name === name);
            const c = sqlConstraints.find(c => c.name === name && c.type === "u");
            if (s.unique) {
                if (!c) {
                    if (i) {
                        script.push(dropIndex(name));
                    }
                    script.push(createConstraint(spec, s));
                }
            }
            else {
                if (c) {
                    script.push(dropConstraint(spec, name));
                }
                if (!i) {
                    script.push(createIndex(spec, s));
                }
            }
        }
        // Drop deprecated
        doneIndexes[spec.name + "_pkey"] = true;
        doneConstraints[spec.name + "_pkey"] = true;
        for (const c of sqlConstraints) {
            if (!doneConstraints[c.name]) {
                doneIndexes[c.name] = true;
                script.push(dropConstraint(spec, c.name));
            }
        }
        for (const i of sqlIndexes) {
            if (!doneIndexes[i.name]) {
                script.push(dropIndex(i.name));
            }
        }
        for (const c of sqlColumns) {
            if (!doneColumns[c.name] && process.env.NODE_ENV !== "production") {
                script.push(dropColumn(spec, c.name));
            }
        }
    }
    await _1.sql.begin(tsql => script.map(s => tsql.unsafe(s)));
}
async function tableExists(spec) {
    const res = await (0, _1.sql) `select exists (
    select from pg_tables
      where schemaname='public' and tablename=${spec.name}
  )`;
    return res.length === 1 && res[0].exists;
}
function getTableColumns(spec) {
    return (0, _1.sql) `
    select
      attname as name,
      format_type(atttypid, atttypmod) as type,
      attnotnull as notnull
    from pg_attribute
      where attrelid='${(0, _1.sql)(spec.name)}'::regclass
        and attnum > 0 and not attisdropped
      order by attnum
  `;
}
function getTableIndexes(spec) {
    return (0, _1.sql) `
    select indexname as name, indexdef as type
      from pg_indexes
      where schemaname='public' and tablename=${spec.name}
  `;
}
function getTableConstraints(spec) {
    return (0, _1.sql) `
    select conname as name, contype as type
      from pg_constraint
      where conrelid='${(0, _1.sql)(spec.name)}'::regclass
  `;
}
function createTable(spec) {
    return (0, arrays_1.lined)((0, arrays_1.spaced)("create table", quote(spec.name), "("), (0, arrays_1.commasLined)(...(0, spec_1.storedFields)(spec.fields).map(f => "  " + (0, arrays_1.spaced)(quote(f.name), ...fieldDef(f)))), ")");
}
function createConstraint(spec, i) {
    return (0, arrays_1.spaced)(alter(spec), "add constraint", quote(indexName(spec, i.fields)), "unique (" + (0, arrays_1.commas)(...i.fields) + ")");
}
function dropConstraint(spec, n) {
    return (0, arrays_1.spaced)(alter(spec), "drop constraint if exists", quote(n));
}
function createIndex(spec, i) {
    return (0, arrays_1.spaced)("create index", quote(indexName(spec, i.fields)), "on", quote(spec.name), "(" + (0, arrays_1.commas)(...i.fields) + ")");
}
function dropIndex(n) {
    return (0, arrays_1.spaced)("drop index if exists", n);
}
function addColumn(spec, f) {
    return (0, arrays_1.spaced)(alter(spec), "add", quote(f.name), ...fieldDef(f));
}
function alterColumn(spec, f, c, ef) {
    const script = [];
    if (TYPES[f.type] !== c.type) {
        script.push(alterColumnType(spec, f));
    }
    if (!c.notnull !== f.nullable) {
        script.push(...alterColumnNotNull(spec, f, ef));
    }
    return script;
}
function alterColumnType(spec, f) {
    return (0, arrays_1.spaced)(alter(spec, f), "type", TYPES[f.type]);
}
function alterColumnNotNull(spec, f, ef) {
    const script = [];
    if (!f.nullable) {
        if (f.onAdd) {
            if (f.onAdd === "delete_old_rows") {
                script.push(deleteRows(spec));
            }
            else if (f.onAdd === "set_old_rows") {
                if (!f.onAddValue) {
                    throw ef.get("${modelMust} include an sql expression as a third argument", `to: onFieldAdd("${f.name}", "set_old_rows", ...)`);
                }
                script.push(updateRows(spec, f, f.onAddValue));
            }
        }
        else {
            throw ef.get("${modelMust} include \"onFieldAdd\" in the register chain to", "declare a policy for setting a non null value for the added", `field "${f.name}" (or manually drop the table)`);
        }
    }
    script.push((0, arrays_1.spaced)(alter(spec, f), f.nullable ? "drop" : "set", "not null"));
    return script;
}
function renameColumn(spec, f, old) {
    return (0, arrays_1.spaced)(alter(spec), "rename", quote(old.name), "to", quote(f.name));
}
function dropColumn(spec, n) {
    return (0, arrays_1.spaced)(alter(spec), "drop", quote(n));
}
function deleteRows(spec) {
    return (0, arrays_1.spaced)("delete from", quote(spec.name));
}
function updateRows(spec, f, exp) {
    return (0, arrays_1.spaced)("update", quote(spec.name), "set", quote(f.name), "=", exp);
}
function quote(name) {
    return `"${name}"`;
}
function indexName(spec, fields) {
    return spec.name + "_" + fields.join("_");
}
function fieldDef(f) {
    if (f.name === "id") {
        return ["bigserial", "primary key"];
    }
    if (f.name === "created") {
        return ["timestamp", "not null", "default now()"];
    }
    return [
        TYPES[f.type],
        !f.nullable && "not null",
    ];
}
function alter(spec, f) {
    return (0, arrays_1.spaced)("alter table", quote(spec.name), f && (0, arrays_1.spaced)("alter", quote(f.name)));
}
