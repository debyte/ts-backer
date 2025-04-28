import { PACKAGE } from "./constants";

export class GeneralError extends Error {
  constructor(message: string) {
    super(message);
    this.name = `${PACKAGE}-error`;
  }
}

export class RelationAccessError extends GeneralError {
  constructor() {
    super("Entity must be created or updated before using relation controls");
    this.name = `${PACKAGE}-relation-error`;
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

const notFoundName = `${PACKAGE}-model-not-found`;

export class ModelNotFoundError extends ModelError {
  constructor(message: string, path: string) {
    super(message, path);
    this.name = notFoundName;
  }
}

export function isModelNotFoundError(err: unknown): boolean {
  return (
    err !== null
    && typeof err === "object"
    && "name" in err
    && err.name === notFoundName
  );
}
