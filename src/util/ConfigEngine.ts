import { resolve, join } from "node:path";
import { readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";

const DEFAULT_EXTENSION = "mjs";

class ConfigEngine<T> {
  private name: string;
  private path: string | undefined;
  store: T;

  constructor(name: string, typing: T) {
    this.name = name;
    this.store = { ...typing };
  }

  read() {
    this.store = this.loadFirstExisting([
      [["mjs"], (path: string) => {
        const p = resolve(path);
        return eval(`import("${p}").then(m => m.default);`) as Partial<T>;
      }],
      [["cjs", "js"], (path: string) => {
        const p = resolve(path);
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(p) as Partial<T>;
      }],
      [["json"], (path: string) => {
        return JSON.parse(readFileSync(path, "utf8")) as Partial<T>;
      }],
    ]);
  }

  private loadFirstExisting(
    attempts: Array<[
      extensions: string[],
      loader: (filePath: string) => Partial<T>,
    ]>
  ): T {
    for (const [extensions, loader] of attempts) {
      for (const ext of extensions) {
        const path = this.makePath(ext);
        try {
          statSync(path);
          const values = loader(path);
          this.path = path;
          return { ...this.store, ...values };
        } catch (_err: unknown) {
          // Ignore
        }
      }
    }
    return this.store;
  }

  private makePath(extension: string) {
    return join(".", `${this.name}.config.${extension}`);
  }

  write(): string {
    if (this.path === undefined) {
      this.path = this.makePath(DEFAULT_EXTENSION);
    }
    const json = JSON.stringify(this.store, null, 2);
    if (this.path.endsWith(".mjs")) {
      writeFileSync(
        this.path,
        `const config = ${json};\n\nexport default config;\n`
      );
    } else if (this.path.endsWith(".cjs") || this.path.endsWith(".js")) {
      writeFileSync(this.path, `module.exports = ${json};\n`);
    } else if (this.path.endsWith(".json")) {
      writeFileSync(this.path, `${json}\n`);
    } else {
      throw new Error("Configuration has unknown extension: " + this.path);
    }
    return this.path;
  }

  remove() {
    if (this.path !== undefined) {
      unlinkSync(this.path);
    }
  }
}

export default ConfigEngine;
