import { PACKAGE } from "./ts-backer/constants";
import ConfigEngine from "./ts-config/ConfigEngine";

const ConfigTyping = {
  TSCONFIG_PATH: "tsconfig.json",
  MODEL_FILE_PATTERN: "src/model/${name}.ts",
  CACHE_FILE_PATTERN: "src/model/.cache/${name}.json",
}

export const engine = new ConfigEngine(PACKAGE, ConfigTyping);

engine.read();
const Config = engine.store;

export default Config;
