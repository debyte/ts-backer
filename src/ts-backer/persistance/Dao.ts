import Timed from "../cache/Timed";
import Entity from "../Entity";
import Query from "./Query";

interface Dao<T extends Entity> extends Timed {
  get(id: number): T | null;
  getAll(): T[];
  save(entity: T): boolean;
  query(): Query<T>;
}

export default Dao;
