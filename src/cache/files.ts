import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
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
  mkdirSync(dirname(path), { recursive: true });
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

type PathAndName = { path: string, name: string };

export function findMatchingFiles(configured: string): PathAndName[] {
  const paths: PathAndName[] = [];
  const re = new RegExp(
    "^" + configured.replace("${name}", "(\\w+)") + "$"
  );
  const i = configured.indexOf("${name}");
  const dir = dirname(configured.slice(0, i) + "foo");
  for (const f of readdirSync(dir, { recursive: true })) {
    const path = join(dir, f as string);
    const match = path.match(re);
    if (match && match[1]) {
      paths.push({ path, name: match[1] });
    }
  }
  return paths;
}
