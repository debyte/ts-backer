import EntitySpec from "../spec/EntitySpec";
export declare function toPath(configured: string, name: string): string;
export declare function loadSpec(path: string): EntitySpec;
export declare function writeSpec(path: string, spec: EntitySpec): void;
export declare function isFileMissing(err: unknown): boolean;
type PathAndName = {
    path: string;
    name: string;
};
export declare function findMatchingFiles(configured: string): PathAndName[];
export {};
