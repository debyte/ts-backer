import { statSync } from "node:fs";
import { analyseModelFile } from "../analyse";
import Config from "../Config";
import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import { CacheError, ModelError } from "../errors";
import Dao from "../persistance/Dao";
import EntitySpec from "../spec/EntitySpec";
import {
  findMatchingFiles,
  isFileMissing,
  loadSpec,
  toPath,
  writeSpec,
} from "./files";
import ModelCache from "./ModelCache";

class DevModelCache implements ModelCache {

  private cache: Record<string, Dao<Entity>>;

  constructor() {
    this.cache = {};
  }

  listAvailableModels(): string[] {
    return findMatchingFiles(Config.MODEL_FILE_PATTERN).map(({ name }) => name);
  }

  get<T extends Entity, D extends Dao<T>>(
    name: string,
    maker: (spec: EntitySpec) => D,
  ): DaoBuilder<T, D> {

    // Get entity modification time
    const path = toPath(Config.MODEL_FILE_PATTERN, name);
    const modified = this.getModified(path);

    // Try in-class cache
    const cached = this.cache[name];
    if (cached !== undefined && cached.time === modified) {
      return new DaoBuilder<T, D>(cached as D);
    }

    // Try cached specification
    const cachePath = toPath(Config.CACHE_FILE_PATTERN, name);
    const spec = this.getCached(cachePath);
    if (spec !== undefined && spec.time === modified) {
      const dao = maker(spec);
      this.cache[name] = dao;
      return new DaoBuilder<T, D>(dao);
    }

    // Analyse new or modified entities
    const newSpec = analyseModelFile(name, path, modified);
    writeSpec(cachePath, newSpec);
    const dao = maker(newSpec);
    this.cache[name] = dao;
    return new DaoBuilder<T, D>(dao);
  }

  peek<T extends Entity>(name: string): Dao<T> {
    if (name in this.cache) {
      return this.cache[name] as Dao<T>;
    }
    throw new CacheError("Peeked uncached dao by name: " + name);
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
