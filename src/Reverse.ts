import Entity from "./Entity";
import { RelationAccessError } from "./errors";

class Reverse<T extends Entity> {

  getOne(): Promise<T | undefined> {
    throw new RelationAccessError();
  }

  getAll(): Promise<T[]> {
    throw new RelationAccessError();
  }
}

export default Reverse;
