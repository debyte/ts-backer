#!/usr/bin/env node

import { statSync } from "node:fs";
import Config, { engine } from "./Config";
import { analyseModelFile } from "./analyse";
import { findMatchingFiles, toPath, writeSpec } from "./cache/files";
import { PACKAGE } from "./constants";
import { ModelError } from "./errors";
import { lined } from "./util/arrays";
import { migrate } from "./persistance/migrate";

function usage() {
  console.log(lined(
    `${PACKAGE}: Automated backend API based on model classes`,
    "  help     -  Shows this usage.",
    "  config   -  Creates a configuration file with default values.",
    "  analyse  -  Analyses model classes, writes cache files, and migrates",
    "              databases. In development, analysis are automatically",
    "              triggered on changing a model file.",
  ));
}

function config() {
  const path = engine.write();
  console.log("Wrote configuration to: " + path);
  process.exit(0);
}

async function analyse() {
  for (const { path, name } of findMatchingFiles(Config.MODEL_FILE_PATTERN)) {
    const stat = statSync(path);
    try {
      const spec = analyseModelFile(name, path, stat.mtime.getTime());
      writeSpec(toPath(Config.CACHE_FILE_PATTERN, name), spec);
      await migrate(spec);
    } catch (e: unknown) {
      if (e instanceof ModelError) {
        console.log(`ERROR in model file: ${path}\n* ${e.message}`);
      } else {
        throw e;
      }
    }
  }
  process.exit(0);
}

const arg = process.argv;
const helpFlag = ["help", "--help", "-h"].some(a => arg.includes(a));
if (!helpFlag) {
  if (arg.includes("config")) {
    config();
  }
  if (arg.includes("analyse")) {
    analyse();
  }
}
usage();
