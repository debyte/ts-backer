import { PACKAGE } from "./constants";
import ConfigEngine from "./util/ConfigEngine";

const root = process.env.NODE_ENV === "test" ? "tests" : "src";

const ConfigTyping = {
  TSCONFIG_PATH: "tsconfig.json",
  MODEL_FILE_PATTERN: root + "/model/${name}.ts",
  CACHE_FILE_PATTERN: root + "/model/.cache/${name}.json",
}

export const engine = new ConfigEngine(PACKAGE, ConfigTyping);

engine.read();
const Config = engine.store;

export default Config;
