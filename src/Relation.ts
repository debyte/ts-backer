import Entity from "./Entity";
import { RelationAccessError } from "./errors";

class Relation<T extends Entity> {
  id?: string; // => psql text

  constructor(related?: string | T) {
    if (typeof related === "string") {
      this.id = related;
    } else if (related) {
      this.id = related.id;
    }
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
