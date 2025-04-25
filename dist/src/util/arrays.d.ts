import { NullablePrimitive } from "./primitives";
export declare function first<T>(array: T[]): T | undefined;
export declare function concat(sep: string, parts: NullablePrimitive[]): string;
export declare function lined(...lines: NullablePrimitive[]): string;
export declare function spaced(...parts: NullablePrimitive[]): string;
export declare function commas(...parts: NullablePrimitive[]): string;
export declare function commasLined(...parts: NullablePrimitive[]): string;
