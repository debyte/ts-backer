import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";

interface ModelCache {
  get<T extends Entity>(name: string): DaoBuilder<T>;
}

export default ModelCache;
