import ModelCache from "./cache/ModelCache";
import DaoBuilder from "./DaoBuilder";
import Entity from "./Entity";
import Dao from "./persistance/Dao";
import Relation from "./Relation";
import Reverse from "./Reverse";
import EntitySpec from "./spec/EntitySpec";
export { default as Entity } from "./Entity";
export * from "./errors";
export * from "./fields";
export { default as Dao } from "./persistance/Dao";
export declare const CACHE: ModelCache;
/**
 * @returns a list of availables entity names
 */
export declare function listAvailable(): string[];
/**
 * Registers an entity to the persistance system and produces a DAO.
 * The entity is specified using properties in a typed interface
 * and the specification builder methods when necessary. The interface
 * declaration and the register call MUST be placed in a model file
 * that adheres to the model path pattern.
 *
 * @param name the entity name (= file name without file extension)
 * @returns a specification builder that finally produces the DAO
 */
export declare function register<T extends Entity>(name: string): DaoBuilder<T, Dao<T>>;
/**
 * Registers an entity to the persistance system and produces a custom
 * DAO using the provided constructor. The entity is specified using
 * properties in a typed interface and the specification builder methods
 * when necessary. The interface declaration and the register call MUST
 * be placed in a model file that adheres to the model path pattern.
 *
 * @param name the entity name (= file name without file extension)
 * @param maker a custom dao maker
 * @returns a specification builder that finally produces the DAO
 */
export declare function registerUsingDao<T extends Entity, D extends Dao<T>>(name: string, maker: (spec: EntitySpec) => D): DaoBuilder<T, D>;
/**
 * Creates a relation for entity creation.
 * @param related the related entity
 * @returns relation placeholder
 */
export declare function relation<T extends Entity>(related: T): Relation<T>;
/**
 * Creates a reverse relation placeholder for entity creation.
 * @returns reverse relation placeholder
 */
export declare function reverse<T extends Entity>(): Reverse<T>;
/**
 * Accesses cached dao if one exists (for system internal use).
 */
export declare function peek<T extends Entity>(name: string): Dao<T>;
/**
 * Ends system resources, i.e. after automated unit tests.
 */
export declare function end(): Promise<void>;
