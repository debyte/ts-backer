import Entity from "./Entity";
import Dao from "./persistance/Dao";

/**
 * Offers clear and typed methods to refine entity specification beyond that
 * in the model interface. Finally, gets the entity DAO. The specification
 * methods have no effect in the program but are read in the entity analysis.
 */
class DaoBuilder<T extends Entity> {
  private impl: Dao<T>;

  constructor(dao: Dao<T>) {
    this.impl = dao;
  }

  dao(): Dao<T> {
    return this.impl;
  }

  index(..._fields: (keyof T)[]): DaoBuilder<T> {
    return this;
  }

  uniqueIndex(..._fields: (keyof T)[]): DaoBuilder<T> {
    return this;
  }
}

export default DaoBuilder;
