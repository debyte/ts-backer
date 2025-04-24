import { PendingQuery, Row } from "postgres";
import { sql } from ".";
import { DEFAULT_ALL_LIMIT } from "../constants";
import Entity from "../Entity";
import { isRelation } from "../spec";
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


  async save(entity: T): Promise<boolean> {
    await this.init();
    if (entity.id !== "") {
      //TODO set map fields
      await sql`
        update ${sql(this.spec.name)}
          set ... 
          where id = ${entity.id}
      `;
      return true;
    }
    await sql`insert into ${sql(this.spec.name)} values ...`;
    return false;
  }

  protected async select(query: PendingQuery<Row[]>): Promise<T[]> {
    await this.init();
    return (await query).map(r => this.rowToEntity(r));
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

  protected rowToEntity(row: Row): T {
    const e: Record<string, unknown> = {};
    const id = row["id"];
    for (const f of this.spec.fields) {
      e[f.name] = this.columnToEntity(f, row[f.name], id);
    }
    return e as T
  }

  protected columnToEntity(
    f: EntityFieldSpec,
    val: unknown,
    id: unknown,
  ): unknown {
    if (isRelation(f)) {
      switch (f.relationType) {
        case "oneToOne":
        case "manyToOne":
          return new RelationControl(f, val as string | undefined);
        case "oneToOneReverse":
        case "manyToOneReverse":
          return new ReverseAccess(this.spec, f, id as string | undefined);
      }
    }
    return val;
  }
}

export default Dao;
