import Config from "../Config";
import { PACKAGE } from "../constants";
import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import { CacheError } from "../errors";
import Dao from "../persistance/Dao";
import EntitySpec from "../spec/EntitySpec";
import { isFileMissing, loadSpec, toPath } from "./files";
import ModelCache from "./ModelCache";

class ProdModelCache implements ModelCache {

  private cache: Record<string, Dao<Entity>>;

  constructor() {
    this.cache = {};
  }

  get<T extends Entity, D extends Dao<T>>(
    name: string,
    maker: (spec: EntitySpec) => D,
  ): DaoBuilder<T, D> {
    const dao = this.cache[name];
    if (dao !== undefined) {
      return new DaoBuilder<T, D>(dao as D);
    }

    // Lazy load entity specifications
    const path = toPath(Config.CACHE_FILE_PATTERN, name);
    const lazyDao = maker(this.getCached(path));
    this.cache[name] = lazyDao;
    return new DaoBuilder<T, D>(lazyDao);
  }

  private getCached(path: string): EntitySpec {
    try {
      return loadSpec(path);
    } catch (err: unknown) {
      if (isFileMissing(err)) {
        throw new CacheError(
          `Required cache file "${path}" is missing in production env.`
          + " It should be generated automatically when developing with "
          + ` ${PACKAGE} or by running: ${PACKAGE} analyse`
        );
      }
      throw err;
    }
  }

  peek<T extends Entity>(name: string): Dao<T> {
    if (name in this.cache) {
      return this.cache[name] as Dao<T>;
    }
    throw new CacheError("Peeked uncached dao by name: " + name);
  }
}

export default ProdModelCache;
