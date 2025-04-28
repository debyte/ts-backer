import { Dao, Entity } from "..";
import ModelCache from "./ModelCache";
export declare const cache: ModelCache;
export declare function listAvailable(): string[];
export declare function getGenericDao(name: string): Dao<Entity>;
