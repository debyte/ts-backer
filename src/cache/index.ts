import { Dao, Entity } from "..";
import DevModelCache from "./DevModelCache";
import ModelCache from "./ModelCache";
import ProdModelCache from "./ProdModelCache";

export const cache: ModelCache = process.env.NODE_ENV === "production"
  ? new ProdModelCache()
  : new DevModelCache();

export function listAvailable(): string[] {
  return cache.list();
}

export function getGenericDao(name: string): Dao<Entity> {
  return cache.get(name, spec => new Dao<Entity>(spec)).dao();
}
