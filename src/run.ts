#!/usr/bin/env node

import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import Config, { engine } from "./Config";
import { analyseModelFile } from "./analyse";
import { toPath, writeSpec } from "./cache/files";
import { PACKAGE } from "./constants";
import { ModelError } from "./errors";

function Usage() {
  console.log([
    `${PACKAGE}: Automated backend API based on model classes`,
    "  help     -  Shows this usage.",
    "  config   -  Creates a configuration file with default values.",
    "  analyse  -  Analyses model classes and writes cache files.",
    "              In development, analysis are automatic on model change."
  ].join("\n"));
}

const arg = process.argv;
const helpFlag = ["help", "--help", "-h"].some(a => arg.includes(a));

// Create configuration
if (!helpFlag && arg.includes("config")) {
  const path = engine.write();
  console.log("Wrote configuration to: " + path);
  process.exit(0);
}

// Analyse all model classes
if (!helpFlag && arg.includes("analyse")) {
  const re = new RegExp(
    "^" + Config.MODEL_FILE_PATTERN.replace("${name}", "(\\w+)") + "$"
  );
  const i = Config.MODEL_FILE_PATTERN.indexOf("${name}");
  const dir = dirname(Config.MODEL_FILE_PATTERN.slice(0, i) + "foo");
  for (const f of readdirSync(dir, { recursive: true })) {
    const path = join(dir, f as string);
    const match = path.match(re);
    if (match && match[1]) {
      const name = match[1];
      const stat = statSync(path);
      try {
        const spec = analyseModelFile(name, path, stat.mtime.getTime());
        writeSpec(toPath(Config.CACHE_FILE_PATTERN, name), spec);
      } catch (e: unknown) {
        if (e instanceof ModelError) {
          console.log(`ERROR in model file: ${path}\n* ${e.message}`);
        } else {
          throw e;
        }
      }
    }
  }
  process.exit(0);
}

Usage();
