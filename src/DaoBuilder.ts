import Entity from "./Entity";
import Dao from "./persistance/Dao";

/**
 * Offers clear and typed methods to refine entity specification beyond that
 * in the model interface. Finally, gets the entity DAO. The specification
 * methods have no effect when run but are read in the entity analysis before.
 */
class DaoBuilder<T extends Entity, D extends Dao<T>> {
  private impl: D;

  constructor(dao: D) {
    this.impl = dao;
  }

  dao(): D {
    return this.impl;
  }

  index(..._fields: (keyof T)[]): DaoBuilder<T, D> {
    return this;
  }

  uniqueIndex(..._fields: (keyof T)[]): DaoBuilder<T, D> {
    return this;
  }
}

export default DaoBuilder;
