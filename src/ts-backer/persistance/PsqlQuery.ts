import Entity from "../Entity";
import Query from "./Query";

class PsqlQuery<T extends Entity> implements Query<T> {

  select(): Query<T> {
    // construct
    return this;
  }

  where(): Query<T> {
    // construct
    return this;
  }

  sort(): Query<T> {
    // construct
    return this;
  }

  limit(): Query<T> {
    // construct
    return this;
  }

  results(): T[] {
    return [];
  }
}

export default PsqlQuery;
