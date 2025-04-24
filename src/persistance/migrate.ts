import { sql } from ".";
import ModelErrorFactory from "../analyse/ModelErrorFactory";
import { storedFields } from "../spec";
import EntityFieldSpec, { EntityFieldType } from "../spec/EntityFieldSpec";
import EntityIndexSpec from "../spec/EntityIndexSpec";
import EntitySpec from "../spec/EntitySpec";
import { commas, commasLined, lined, spaced } from "../util/arrays";
import { NullablePrimitive } from "../util/primitives";

const TYPES: Record<EntityFieldType, string> = {
  id: "bigint",
  string: "text",
  number: "double precision",
  boolean: "boolean",
  timestamp: "timestamp without time zone",
  json: "jsonb",
};

type NameAndType = { name: string, type: string, notnull?: boolean };

export async function migrate(spec: EntitySpec) {
  const script: string[] = [];
  const ef = new ModelErrorFactory(spec.name, spec.path);

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
        if (s.onAdd === "rename") {
          const c = sqlColumns.find(c => c.name === s.onAddValue);
          if (!c) {
            throw ef.get("${model} has an unknown field name in \"rename\"");
          }
          doneColumns[s.name] = true;
          script.push(
            renameColumn(spec, s, c),
            ...alterColumn(spec, s, c, ef),
          );
        } else {
          script.push(addColumn(spec, { ...s, nullable: true }));
          if (!s.nullable) {
            script.push(...alterColumnNotNull(spec, s, ef));
          }
        }
      } else if (s.name !== "id" && s.name !== "created") {
        script.push(...alterColumn(spec, s, c, ef));
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
      if (!doneColumns[c.name] && process.env.NODE_ENV !== "production") {
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

function createConstraint(spec: EntitySpec, i: EntityIndexSpec): string {
  return spaced(
    alter(spec),
    "add constraint",
    quote(indexName(spec, i.fields)),
    "unique (" + commas(...i.fields) + ")",
  );
}

function dropConstraint(spec: EntitySpec, n: string): string {
  return spaced(alter(spec), "drop constraint if exists", quote(n));
}

function createIndex(spec: EntitySpec, i: EntityIndexSpec): string {
  return spaced(
    "create index",
    quote(indexName(spec, i.fields)),
    "on",
    quote(spec.name),
    "(" + commas(...i.fields) + ")",
  );
}

function dropIndex(n: string): string {
  return spaced("drop index if exists", n);
}

function addColumn(spec: EntitySpec, f: EntityFieldSpec): string {
  return spaced(alter(spec), "add", quote(f.name), ...fieldDef(f));
}

function alterColumn(
  spec: EntitySpec,
  f: EntityFieldSpec,
  c: NameAndType,
  ef: ModelErrorFactory,
): string[] {
  const script: string[] = [];
  if (TYPES[f.type] !== c.type) {
    script.push(alterColumnType(spec, f));
  }
  if (!c.notnull !== f.nullable) {
    script.push(...alterColumnNotNull(spec, f, ef));
  }
  return script;
}

function alterColumnType(spec: EntitySpec, f: EntityFieldSpec): string {
  return spaced(alter(spec, f), "type", TYPES[f.type]);
}

function alterColumnNotNull(
  spec: EntitySpec,
  f: EntityFieldSpec,
  ef: ModelErrorFactory,
): string[] {
  const script: string[] = [];
  if (!f.nullable) {
    if (f.onAdd) {
      if (f.onAdd === "delete_old_rows") {
        script.push(deleteRows(spec));
      } else if (f.onAdd === "set_old_rows") {
        if (!f.onAddValue) {
          throw ef.get(
            "${modelMust} include an sql expression as a third argument",
            `to: onFieldAdd("${f.name}", "set_old_rows", ...)`
          );
        }
        script.push(updateRows(spec, f, f.onAddValue));
      }
    } else {
      throw ef.get(
        "${modelMust} include \"onFieldAdd\" in the register chain to",
        "declare a policy for setting a non null value for the added",
        `field "${f.name}" (or manually drop the table)`
      );
    }
  }
  script.push(spaced(alter(spec, f), f.nullable ? "drop" : "set", "not null"));
  return script;
}

function renameColumn(
  spec: EntitySpec,
  f: EntityFieldSpec,
  old: NameAndType
): string {
  return spaced(alter(spec), "rename", quote(old.name), "to", quote(f.name));
}

function dropColumn(spec: EntitySpec, n: string): string {
  return spaced(alter(spec), "drop", quote(n));
}

function deleteRows(spec: EntitySpec): string {
  return spaced("delete from", quote(spec.name));
}

function updateRows(spec: EntitySpec, f: EntityFieldSpec, exp: string): string {
  return spaced("update", quote(spec.name), "set", quote(f.name), "=", exp);
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
