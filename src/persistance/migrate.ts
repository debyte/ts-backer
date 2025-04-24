import { sql } from ".";
import ModelErrorFactory from "../analyse/ModelErrorFactory";
import { storedFields } from "../spec";
import EntityFieldSpec, { EntityFieldType } from "../spec/EntityFieldSpec";
import EntityIndexSpec from "../spec/EntityIndexSpec";
import EntitySpec from "../spec/EntitySpec";
import { commas, commasLined, lined, spaced } from "../util/arrays";
import { NullablePrimitive } from "../util/primitives";

const TYPES: Record<EntityFieldType, string> = {
  string: "text",
  number: "double precision",
  boolean: "boolean",
  timestamp: "timestamp without time zone",
  json: "jsonb",
};

type NameAndType = { name: string, type: string, notnull?: boolean };

export async function migrate(spec: EntitySpec) {
  const script: string[] = [];
  if (!await tableExists(spec)) {

    // Create table and indexes
    script.push(createTable(spec));
    for (const s of spec.indexes) {
      if (s.unique) {
        script.push(createConstraint(spec, s));
      } else {
        script.push(createIndex(spec, s));
      }
    }
  } else {

    // Alter columns
    const sqlColumns = await getTableColumns(spec);
    const doneColumns: Record<string, boolean | undefined> = {};
    for (const s of storedFields(spec.fields)) {
      doneColumns[s.name] = true;
      const c = sqlColumns.find(c => c.name === s.name);
      if (!c) {
        if (!s.nullable) {
          const ef = new ModelErrorFactory(spec.name, spec.path);
          throw ef.get(
            "${modelMust} include \"onColumnAdd\" in the register chain to",
            "declare a policy for setting a non null value for the added",
            `column "${s.name}" (or manually drop the table)`
          );
        } else {
          script.push(addColumn(spec, s));
        }
      } else if (s.name !== "id" && s.name !== "created") {
        if (TYPES[s.type] !== c.type) {
          script.push(alterColumnType(spec, s));
        }
        if (!c.notnull !== s.nullable) {
          script.push(alterColumnNotNull(spec, s));
        }
      }
    }

    // Manage indexes
    const sqlIndexes = await getTableIndexes(spec);
    const sqlConstraints = await getTableConstraints(spec);
    const doneIndexes: Record<string, boolean | undefined> = {};
    const doneConstraints: Record<string, boolean | undefined> = {};
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
      } else {
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
      if (!doneColumns[c.name]) {
        script.push(dropColumn(spec, c.name));
      }
    }
  }
  await sql.begin(tsql => script.map(s => tsql.unsafe(s)));
}

async function tableExists(spec: EntitySpec): Promise<boolean> {
  const res = await sql<{ exists: boolean }[]>`select exists (
    select from pg_tables
      where schemaname='public' and tablename=${spec.name}
  )`;
  return res.length === 1 && res[0].exists;
}

function getTableColumns(spec: EntitySpec): Promise<NameAndType[]> {
  return sql<NameAndType[]>`
    select
      attname as name,
      format_type(atttypid, atttypmod) as type,
      attnotnull as notnull
    from pg_attribute
      where attrelid='${sql(spec.name)}'::regclass
        and attnum > 0 and not attisdropped
      order by attnum
  `;
}

function getTableIndexes(spec: EntitySpec): Promise<NameAndType[]> {
  return sql<NameAndType[]>`
    select indexname as name, indexdef as type
      from pg_indexes
      where schemaname='public' and tablename=${spec.name}
  `;
}

function getTableConstraints(spec: EntitySpec): Promise<NameAndType[]> {
  return sql<NameAndType[]>`
    select conname as name, contype as type
      from pg_constraint
      where conrelid='${sql(spec.name)}'::regclass
  `;
}

function createTable(spec: EntitySpec): string {
  return lined(
    spaced("create table", quote(spec.name), "("),
    commasLined(
      ...storedFields(spec.fields).map(
        f => "  " + spaced(quote(f.name), ...fieldDef(f))
      )
    ),
    ")",
  );
}

function createConstraint(spec: EntitySpec, i: EntityIndexSpec) {
  return spaced(
    alter(spec),
    "add constraint",
    quote(indexName(spec, i.fields)),
    "unique (" + commas(...i.fields) + ")",
  );
}

function createIndex(spec: EntitySpec, i: EntityIndexSpec) {
  return spaced(
    "create index",
    quote(indexName(spec, i.fields)),
    "on",
    quote(spec.name),
    "(" + commas(...i.fields) + ")",
  );
}

function addColumn(spec: EntitySpec, f: EntityFieldSpec): string {
  return spaced(alter(spec), "add", quote(f.name), ...fieldDef(f));
}

function alterColumnType(spec: EntitySpec, f: EntityFieldSpec): string {
  return spaced(alter(spec, f), "type", TYPES[f.type]);
}

function alterColumnNotNull(spec: EntitySpec, f: EntityFieldSpec): string {
  return spaced(
    alter(spec, f), f.nullable ? "drop" : "set", "not null"
  );
}

function dropColumn(spec: EntitySpec, n: string) {
  return spaced(alter(spec), "drop", quote(n));
}

function dropConstraint(spec: EntitySpec, n: string) {
  return spaced(alter(spec), "drop constraint", quote(n));
}

function dropIndex(n: string) {
  return spaced("drop index", n);
}

function quote(name: string): string {
  return `"${name}"`;
}

function indexName(spec: EntitySpec, fields: string[]): string {
  return spec.name + "_" + fields.join("_");
}

function fieldDef(f: EntityFieldSpec): NullablePrimitive[] {
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

function alter(spec: EntitySpec, f?: EntityFieldSpec): string {
  return spaced(
    "alter table",
    quote(spec.name),
    f && spaced("alter", quote(f.name))
  );
}
