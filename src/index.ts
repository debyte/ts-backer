import DevModelCache from "./cache/DevModelCache";
import ModelCache from "./cache/ModelCache";
import ProdModelCache from "./cache/ProdModelCache";
import DaoBuilder from "./DaoBuilder";
import Entity from "./Entity";
import { sql } from "./persistance";
import Dao from "./persistance/Dao";
import Relation from "./Relation";
import Reverse from "./Reverse";
import EntitySpec from "./spec/EntitySpec";

export { default as Entity } from "./Entity";
export { default as Dao } from "./persistance/Dao";
export * from "./fields";
export * from "./errors";

export const CACHE: ModelCache = process.env.NODE_ENV === "production"
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
 * Creates a relation for entity creation.
 * @param related the related entity
 * @returns relation placeholder
 */
export function relation<T extends Entity>(related: T): Relation<T> {
  return new Relation<T>(related);
}

/**
 * Creates a reverse relation placeholder for entity creation.
 * @returns reverse relation placeholder
 */
export function reverse<T extends Entity>(): Reverse<T> {
  return new Reverse<T>();
}

/**
 * Accesses cached dao if one exists (for system internal use).
 */
export function peek<T extends Entity>(name: string): Dao<T> {
  return CACHE.peek<T>(name);
}

/**
 * Ends system resources, i.e. after automated unit tests.
 */
export async function end() {
  await sql.end();
}
