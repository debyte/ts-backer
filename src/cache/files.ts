import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { CacheError } from "../errors";
import EntitySpec from "../spec/EntitySpec";

export function toPath(configured: string, name: string) {
  return configured.replace("${name}", name);
}

export function loadSpec(path: string): EntitySpec {
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (isEntitySpec(data)) {
    return data;
  }
  throw new CacheError(
    `Cache file "${path}" has unexpected content for an entity specification.`
  );
}

export function writeSpec(path: string, spec: EntitySpec) {
  const dir = dirname(path);
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  writeFileSync(path, JSON.stringify(spec, undefined, 2));
}

export function isFileMissing(err: unknown): boolean {
  return (
    err !== null
    && typeof err === "object"
    && "code" in err
    && err.code === "ENOENT"
  );
}

function isEntitySpec(o: unknown): o is EntitySpec {
  return (
    typeof o === "object" && o !== null
    && "time" in o && typeof o.time === "number"
  );
}
