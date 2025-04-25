import { PendingQuery, Row } from "postgres";
import Entity from "../Entity";
import EntityFieldSpec from "../spec/EntityFieldSpec";
import EntitySpec from "../spec/EntitySpec";
declare class Dao<T extends Entity> {
    spec: EntitySpec;
    time: number;
    table: string;
    initFlag: boolean;
    constructor(spec: EntitySpec);
    get(id: string): Promise<T | undefined>;
    getAll(limit?: number, offset?: number): Promise<T[]>;
    getByField(name: string, value: string | number | boolean | Date): Promise<T[]>;
    getOneByField(name: string, value: string | number | boolean | Date): Promise<T | undefined>;
    create(entity: Omit<T, "id" | "created">): Promise<T>;
    save(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
    deleteAll(): Promise<void>;
    protected select(query: PendingQuery<Row[]>): Promise<T[]>;
    protected query(query: PendingQuery<Row[]>): Promise<void>;
    protected init(): Promise<void>;
    protected dbToEntity(row: Row): T;
    protected dbToField(f: EntityFieldSpec, val: unknown, eid: unknown): unknown;
    protected entityToDb(entity: Omit<T, "id" | "created">): Record<string, unknown>;
    protected fieldToDb(f: EntityFieldSpec, val: unknown): unknown;
}
export default Dao;
