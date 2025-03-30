import Entity from "../Entity";
import Dao from "./Dao";
import EntitySpec from "../cache/EntitySpec";
import PsqlDao from "./PsqlDao";

export function createDao<T extends Entity>(spec: EntitySpec): Dao<T> {
  return new PsqlDao<T>(spec);
}
