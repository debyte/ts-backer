import { PACKAGE } from "../constants";
import { ModelError } from "../errors";

class ModelErrorFactory {
  name: string;
  path: string;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  get(...msg: string[]): ModelError {
    return new ModelError(
      msg.join(" ").replaceAll(/\${(\w+)}/g, (_, n) => this.arg(n)),
      this.path
    );
  }

  arg(name: string): string {
    switch (name) {
      case "name":
        return `'${this.name}'`;
      case "path":
        return `"${this.path}"`;
      case "pkg":
        return PACKAGE;
      case "model":
        return `Model file "${this.path}"`;
      case "modelMust":
        return `Model file "${this.path}" must`;
      case "interfaceSample":
        return `i.e. export interface ${this.name} extends Entity {...}`;
      case "registerSample":
        return `i.e. export const ${this.name}Dao =`
          + ` register<${this.name}>("${this.name}").dao()`;
    }
    return "UNKNOWN_ERROR_ARGUMENT_NAME";
  }
}

export default ModelErrorFactory;
