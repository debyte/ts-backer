import EntityFieldSpec, { EntityRelation } from "./EntityFieldSpec";
import EntitySpec from "./EntitySpec";

export function isRelation(
  f: EntityFieldSpec
): f is Required<EntityFieldSpec> {
  return f.relationModel !== undefined && f.relationType !== undefined;
}

export function storedFields(fields: EntityFieldSpec[]): EntityFieldSpec[] {
  return fields.filter(
    f => f.relationModel === undefined || !f.relationModel.endsWith("Reverse")
  );
}

export function valueFields(fields: EntityFieldSpec[]): EntityFieldSpec[] {
  return fields.filter(f => f.relationModel === undefined);
}

export function relationFields(fields: EntityFieldSpec[]): EntityFieldSpec[] {
  return fields.filter(f => f.relationModel !== undefined);
}

export function reverseField(
  source: EntitySpec,
  target: EntitySpec,
  field: Required<EntityFieldSpec>,
): EntityFieldSpec | undefined {
  const t = getReverseType(field.relationType);
  return source.fields.find(
    f => f.relationModel === target.name && f.relationType === t
  );
}

function getReverseType(t: EntityRelation): EntityRelation | undefined {
  switch (t) {
    case "oneToOneReverse":
      return "oneToOne";
    case "manyToOneReverse":
      return "manyToOne";
  }
  return undefined;
}
