import Config from "../Config";
import { PACKAGE } from "../constants";
import DaoBuilder from "../DaoBuilder";
import Entity from "../Entity";
import { CacheError } from "../errors";
import Dao from "../persistance/Dao";
import EntitySpec from "../spec/EntitySpec";
import { findMatchingFiles, loadSpec, toPath } from "./files";
import ModelCache from "./ModelCache";

class ProdModelCache implements ModelCache {

  private names: string[];
  private specCache: Record<string, EntitySpec>;
  private daoCache: Record<string, Dao<Entity>>;

  constructor() {
    const files = findMatchingFiles(Config.CACHE_FILE_PATTERN);
    this.names = files.map(({ name }) => name);
    this.specCache = Object.fromEntries(
      files.map(f => [f.name, loadSpec(f.path)])
    );
    this.daoCache = {};
  }

  list(): string[] {
    return this.names;
  }

  get<T extends Entity, D extends Dao<T>>(
    name: string,
    maker: (spec: EntitySpec) => D,
  ): DaoBuilder<T, D> {
    if (name in this.daoCache) {
      return new DaoBuilder<T, D>(this.daoCache[name] as D);
    }
    if (name in this.specCache) {
      const dao = maker(this.specCache[name]);
      this.daoCache[name] = dao;
      return new DaoBuilder<T, D>(dao);
    }
    const path = toPath(Config.CACHE_FILE_PATTERN, name);
    throw new CacheError(
      `Required cache file "${path}" is missing in production env.`
      + " It should be generated automatically when developing with"
      + ` ${PACKAGE} or by running: ${PACKAGE} analyse`
    );
  }

  peek<T extends Entity>(name: string): Dao<T> {
    if (name in this.daoCache) {
      return this.daoCache[name] as Dao<T>;
    }
    throw new CacheError("Peeked uncached dao by name: " + name);
  }
}

export default ProdModelCache;
