import { PACKAGE } from "./constants";

export class GeneralError extends Error {
  constructor(message: string) {
    super(message);
    this.name = `${PACKAGE}-error`;
  }
}

export class CacheError extends GeneralError {
  constructor(message: string) {
    super(message);
    this.name = `${PACKAGE}-cache-error`;
  }
}

export class ModelError extends GeneralError {
  model: string;

  constructor(message: string, path: string) {
    super(message);
    this.name = `${PACKAGE}-model-error`;
    this.model = path;
  }
}
