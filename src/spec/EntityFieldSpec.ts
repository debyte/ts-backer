
interface EntityFieldSpec {
  name: string;
  type: EntityFieldType;
  nullable: boolean;
  relationModel?: string;
  relationType?: EntityRelation;
}

export type EntityFieldType =
  | "string"
  | "number"
  | "boolean"
  | "timestamp"
  | "json"
  ;

export type EntityRelation =
  | "oneToOne"
  | "oneToOneReverse"
  | "manyToOne"
  | "manyToOneReverse"
  ;

export default EntityFieldSpec;
