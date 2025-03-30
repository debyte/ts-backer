
interface EntityFieldSpec {
  name: string;
  type: EntityFieldType;
  nullable: boolean;
  json?: boolean;
  relationModel?: string;
  relationType?: EntityRelation;
}

export type EntityFieldType =
  | "string"
  | "boolean"
  | "int"
  | "long"
  | "float"
  | "double"
  | "timestamp"
  | "currency"
  ;

export type EntityRelation =
  | "oneToOne"
  | "oneToOneReverse"
  | "manyToOne"
  | "manyToOneReverse"
  | "manyToMany"
  ;

export default EntityFieldSpec;
