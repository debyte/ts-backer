import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import Dao from "../persistance/Dao";
import EntitySpec from "../spec/EntitySpec";
interface ModelCache {
    list(): string[];
    get<T extends Entity, D extends Dao<T>>(name: string, maker: (spec: EntitySpec) => D): DaoBuilder<T, D>;
    peek<T extends Entity>(name: string): Dao<T>;
}
export default ModelCache;
