import Entity from "./Entity";
import Dao from "./persistance/Dao";
import { OnAddType } from "./spec/EntityFieldSpec";
/**
 * Offers clear and typed methods to refine entity specification beyond that
 * in the model interface. Finally, gets the entity DAO. The specification
 * methods have no effect when run but are read in the entity analysis before.
 */
declare class DaoBuilder<T extends Entity, D extends Dao<T>> {
    private impl;
    constructor(dao: D);
    dao(): D;
    index(..._fields: (keyof T)[]): DaoBuilder<T, D>;
    uniqueIndex(..._fields: (keyof T)[]): DaoBuilder<T, D>;
    onFieldAdd(_field: keyof T, _type: OnAddType, _columnNameOrSqlExpression?: string): this;
}
export default DaoBuilder;
