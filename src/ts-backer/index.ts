import DevModelCache from "./cache/DevModelCache";
import ModelCache from "./cache/ModelCache";
import ProdModelCache from "./cache/ProdModelCache";
import DaoBuilder from "./DaoBuilder";
import Entity from "./Entity";

const CACHE: ModelCache = process.env.NODE_ENV === "production"
  ? new ProdModelCache() : new DevModelCache();

/**
 * Registers an entity to the persistance system and produces a DAO.
 * The entity is specified using properties in a typed interface
 * and the specification builder methods when necessary. The interface
 * declaration and the register call MUST be placed in a model file
 * that adheres to the model path pattern.
 *
 * @param name the model file name without file extension
 * @returns a specification builder that finally produces the DAO
 */
export function register<T extends Entity>(name: string): DaoBuilder<T> {
  return CACHE.get(name);
}
