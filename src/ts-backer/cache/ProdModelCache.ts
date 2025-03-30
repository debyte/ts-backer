import Config from "../../Config";
import { PACKAGE } from "../constants";
import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import { CacheError } from "../errors";
import { createDao } from "../persistance";
import Dao from "../persistance/Dao";
import EntitySpec from "./EntitySpec";
import { isFileMissing, loadSpec, toPath } from "./files";
import ModelCache from "./ModelCache";

class ProdModelCache implements ModelCache {

  private cache: Record<string, Dao<Entity>>;

  constructor() {
    this.cache = {};
  }

  get<T extends Entity>(name: string): DaoBuilder<T> {
    const dao = this.cache[name];
    if (dao !== undefined) {
      return new DaoBuilder(dao as Dao<T>);
    }

    // Lazy load entity specifications
    const path = toPath(Config.CACHE_FILE_PATTERN, name);
    const lazyDao = createDao<T>(this.getCached(path));
    this.cache[name] = lazyDao;
    return new DaoBuilder(lazyDao);
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
}

export default ProdModelCache;
