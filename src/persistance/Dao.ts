import { PendingQuery, Row } from "postgres";
import { sql } from ".";
import { DEFAULT_ALL_LIMIT } from "../constants";
import Entity from "../Entity";
import { GeneralError } from "../errors";
import Relation from "../Relation";
import { isRelation, storedFields } from "../spec";
import EntityFieldSpec from "../spec/EntityFieldSpec";
import EntitySpec from "../spec/EntitySpec";
import { first } from "../util/arrays";
import { migrate } from "./migrate";
import RelationControl from "./RelationControl";
import ReverseAccess from "./ReverseAccess";

class Dao<T extends Entity> {

  spec: EntitySpec;
  time: number;
  table: string;
  initFlag: boolean;

  constructor(spec: EntitySpec) {
    this.spec = spec;
    this.time = spec.time;
    this.table = spec.name;
    this.initFlag = false;
  }

  async get(id: string): Promise<T | undefined> {
    return this.getOneByField("id", id);
  }

  async getAll(limit?: number, offset?: number): Promise<T[]> {
    return this.select(sql`
      select * from ${sql(this.table)}
        order by id
        limit ${limit || DEFAULT_ALL_LIMIT} offset ${offset || 0}
    `);
  }

  async getByField(
    name: string,
    value: string | number | boolean | Date
  ): Promise<T[]> {
    return this.select(sql`
      select * from ${sql(this.table)}
        where ${sql(name)} = ${value}
        order by created
    `);
  }

  async getOneByField(
    name: string,
    value: string | number | boolean | Date
  ): Promise<T | undefined> {
    return first(await this.getByField(name, value));
  }

  async create(entity: Omit<T, "id" | "created">): Promise<T> {
    const res = await this.select(sql`
      insert into ${sql(this.table)}
        ${sql(this.entityToDb(entity as Partial<T>))}
      returning *
    `);
    if (res.length !== 1) {
      throw new GeneralError("Insert unexpectedly returned no rows");
    }
    return res[0];
  }

  async save(entity: T) {
    return this.update(entity.id, entity);
  }

  async update(id: string, update: Partial<T>) {
    await this.query(sql`
      update ${sql(this.table)} set ${sql(this.entityToDb(update))}
        where id = ${id}
    `);
  }

  async delete(id: string) {
    await this.query(sql`
      delete from ${sql(this.table)} where id = ${id}
    `);
  }

  async deleteAll() {
    await this.query(sql`
      delete from ${sql(this.table)}
    `);
  }

  protected async select(query: PendingQuery<Row[]>): Promise<T[]> {
    await this.init();
    return (await query).map(r => this.dbToEntity(r));
  }

  protected async query(query: PendingQuery<Row[]>) {
    await this.init();
    await query;
  }

  protected async init() {
    if (this.initFlag) {
      return;
    }
    await migrate(this.spec);
    this.initFlag = true;
  }

  protected dbToEntity(row: Row): T {
    const e: Record<string, unknown> = {};
    const id = row["id"];
    for (const f of this.spec.fields) {
      e[f.name] = this.dbToField(f, row[f.name], id);
    }
    return e as T
  }

  protected dbToField(
    f: EntityFieldSpec,
    val: unknown,
    eid: unknown,
  ): unknown {
    if (isRelation(f)) {
      switch (f.relationType) {
        case "oneToOne":
        case "manyToOne":
          return new RelationControl(f, val as string | undefined);
        case "oneToOneReverse":
        case "manyToOneReverse":
          return new ReverseAccess(this.spec, f, eid as string | undefined);
      }
    }
    return val;
  }

  protected entityToDb(entity: Partial<T>): Record<string, unknown> {
    const e = entity as Record<string, unknown>;
    const r: Record<string, unknown> = {};
    for (const f of storedFields(this.spec.fields)) {
      const v = this.fieldToDb(f, e[f.name]);
      if (v !== undefined) {
        r[f.name] = v;
      }
    }
    return r;
  }

  protected fieldToDb(f: EntityFieldSpec, val: unknown): unknown {
    if (f.name === "id" || f.name === "created") {
      return undefined;
    }
    if (isRelation(f) && val) {
      return (val as Relation<Entity>).id;
    }
    return val;
  }
}

export default Dao;
