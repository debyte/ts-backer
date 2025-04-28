import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import Dao from "../persistance/Dao";
import EntitySpec from "../spec/EntitySpec";
import ModelCache from "./ModelCache";
declare class ProdModelCache implements ModelCache {
    private names;
    private specCache;
    private daoCache;
    constructor();
    list(): string[];
    get<T extends Entity, D extends Dao<T>>(name: string, maker: (spec: EntitySpec) => D): DaoBuilder<T, D>;
    peek<T extends Entity>(name: string): Dao<T>;
}
export default ProdModelCache;
