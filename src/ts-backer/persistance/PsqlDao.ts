import Entity from "../Entity";
import Dao from "./Dao";
import EntitySpec from "../cache/EntitySpec";
import PsqlQuery from "./PsqlQuery";
import Query from "./Query";

class PsqlDao<T extends Entity> implements Dao<T> {
  
  time: number;

  constructor(spec: EntitySpec) {
    this.time = spec.time;
  }

  get(_id: number): T | null {
    return null;
  }

  getAll(): T[] {
    return [];
  }

  save(_entity: T): boolean {
    return true;
  }

  query(): Query<T> {
    return new PsqlQuery<T>();
  }
}

export default PsqlDao;
