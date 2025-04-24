interface EntityFieldSpec {
  name: string;
  type: EntityFieldType;
  nullable: boolean;
  relationModel?: string;
  relationType?: EntityRelation;
  onAdd?: OnAddType;
  onAddValue?: string;
}

export type EntityFieldType =
  | "id"
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

export type OnAddType = "delete_old_rows" | "set_old_rows" | "rename";

export function isOnAddType(t: string): t is OnAddType {
  return ["delete_old_rows", "set_old_rows", "rename"].includes(t);
}

export default EntityFieldSpec;
