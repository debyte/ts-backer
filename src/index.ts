import DevModelCache from "./cache/DevModelCache";
import ModelCache from "./cache/ModelCache";
import ProdModelCache from "./cache/ProdModelCache";
import DaoBuilder from "./DaoBuilder";
import Entity from "./Entity";
import Dao from "./persistance/Dao";
import Relation from "./Relation";
import Reverse from "./Reverse";
import EntitySpec from "./spec/EntitySpec";

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
export function register<T extends Entity>(
  name: string
): DaoBuilder<T, Dao<T>> {
  return CACHE.get<T, Dao<T>>(name, spec => new Dao<T>(spec));
}

/**
 * Registers an entity to the persistance system and produces a custom
 * DAO using the provided constructor. The entity is specified using
 * properties in a typed interface and the specification builder methods
 * when necessary. The interface declaration and the register call MUST
 * be placed in a model file that adheres to the model path pattern.
 *
 * @param name the model file name without file extension
 * @param maker a custom dao maker
 * @returns a specification builder that finally produces the DAO
 */
export function registerUsingDao<T extends Entity, D extends Dao<T>>(
  name: string,
  maker: (spec: EntitySpec) => D,
): DaoBuilder<T, D> {
  return CACHE.get<T, D>(name, maker);
}

/**
 * Creates a relation for storing. Use undefined as placeholder.
 * @param related the related id or entity if any
 * @returns relation object
 */
export function relation<T extends Entity>(related?: string | T): Relation<T> {
  return new Relation<T>(related);
}

/**
 * Creates a reverse relation placeholder for storing.
 * @returns 
 */
export function reverse<T extends Entity>(): Reverse<T> {
  return new Reverse<T>();
}

export function peek<T extends Entity>(name: string): Dao<T> {
  return CACHE.peek<T>(name);
}
