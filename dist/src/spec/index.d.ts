import EntityFieldSpec from "./EntityFieldSpec";
import EntitySpec from "./EntitySpec";
export declare function isRelation(f: EntityFieldSpec): f is Required<EntityFieldSpec>;
export declare function storedFields(fields: EntityFieldSpec[]): EntityFieldSpec[];
export declare function valueFields(fields: EntityFieldSpec[]): EntityFieldSpec[];
export declare function relationFields(fields: EntityFieldSpec[]): EntityFieldSpec[];
export declare function reverseField(source: EntitySpec, target: EntitySpec, field: Required<EntityFieldSpec>): EntityFieldSpec | undefined;
