import { NullablePrimitive } from "./primitives";

export function first<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[0] : undefined;
}

export function concat(sep: string, parts: NullablePrimitive[]) {
  return parts.filter(p => !!p).join(sep);
}

export function lined(...lines: NullablePrimitive[]) {
  return concat("\n", lines);
}

export function spaced(...parts: NullablePrimitive[]) {
  return concat(" ", parts);
}

export function commas(...parts: NullablePrimitive[]) {
  return concat(", ", parts);
}

export function commasLined(...parts: NullablePrimitive[]) {
  return concat(",\n", parts);
}
