import { statSync } from "node:fs";
import Config from "../../Config";
import { analyseModelFile } from "../analyse";
import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import { ModelError } from "../errors";
import { createDao } from "../persistance";
import Dao from "../persistance/Dao";
import EntitySpec from "./EntitySpec";
import { isFileMissing, loadSpec, toPath, writeSpec } from "./files";
import ModelCache from "./ModelCache";

class DevModelCache implements ModelCache {

  private cache: Record<string, Dao<Entity>>;

  constructor() {
    this.cache = {};
  }

  get<T extends Entity>(name: string): DaoBuilder<T> {

    // Get entity modification time
    const path = toPath(Config.MODEL_FILE_PATTERN, name);
    const modified = this.getModified(path);

    // Try in-class cache
    const cached = this.cache[name];
    if (cached !== undefined && cached.time === modified) {
      return new DaoBuilder(cached as Dao<T>);
    }

    // Try cached specification
    const cachePath = toPath(Config.CACHE_FILE_PATTERN, name);
    const spec = this.getCached(cachePath);
    if (spec !== undefined && spec.time === modified) {
      const dao = createDao<T>(spec);
      this.cache[name] = dao;
      return new DaoBuilder(dao);
    }

    // Analyse new or modified entities
    const newSpec = analyseModelFile(name, path, modified);
    writeSpec(cachePath, newSpec);
    const dao = createDao<T>(newSpec);
    this.cache[name] = dao;
    return new DaoBuilder(dao);
  }

  private getModified(path: string): number {
    try {
      return statSync(path).mtime.getTime();
    } catch (err: unknown) {
      if (isFileMissing(err)) {
        throw new ModelError(
          `Failed to find model declaration file "${path}", which is`
          + " constructed from the name argument of the register call and the"
          + " configured MODEL_FILE_PATTERN",
          path
        );
      }
      throw err;
    }
  }

  private getCached(path: string): EntitySpec | undefined {
    try {
      return loadSpec(path);
    } catch (err: unknown) {
      if (isFileMissing(err)) {
        return undefined;
      }
      throw err;
    }
  }
}

export default DevModelCache;
