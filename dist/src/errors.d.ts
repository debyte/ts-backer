export declare class GeneralError extends Error {
    constructor(message: string);
}
export declare class RelationAccessError extends GeneralError {
    constructor();
}
export declare class CacheError extends GeneralError {
    constructor(message: string);
}
export declare class ModelError extends GeneralError {
    model: string;
    constructor(message: string, path: string);
}
