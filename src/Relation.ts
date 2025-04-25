import Entity from "./Entity";
import { RelationAccessError } from "./errors";

class Relation<T extends Entity> {
  id?: string; // => psql bigint

  constructor(related: T) {
    this.id = related.id;
  }

  get(): Promise<T | undefined> {
    throw new RelationAccessError();
  }

  set(_related: T) {
    throw new RelationAccessError();
  }

  unset() {
    throw new RelationAccessError();
  }
}

export default Relation;
