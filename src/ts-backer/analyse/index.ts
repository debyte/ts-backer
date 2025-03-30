import {
  CallExpression,
  InterfaceDeclaration,
  Project,
  PropertySignature,
  SyntaxKind,
  Type,
  TypeAliasDeclaration,
  TypeNode,
  TypeReferenceNode
} from "ts-morph";
import Config from "../../Config";
import EntityFieldSpec, { EntityFieldType } from "../cache/EntityFieldSpec";
import EntityIndexSpec from "../cache/EntityIndexSpec";
import EntitySpec from "../cache/EntitySpec";
import {
  getPropertyCall,
  getSingleTypeArgument,
  getStringArguments,
} from "./code";
import ModelErrorFactory from "./ModelErrorFactory";
import ModelTraverser from "./ModelTraverser";

export function analyseModelFile(
  name: string,
  path: string,
  modified: number,
): EntitySpec {
  // TODO, remove or log properly
  console.log(`Analysing model "${name}" at "${path}".`);

  const spec: EntitySpec = {
    name,
    fields: [],
    indexes: [],
    time: modified,
  };

  const error = new ModelErrorFactory(name, path);

  // Parse model source code
  const project = new Project({ tsConfigFilePath: Config.TSCONFIG_PATH });
  const src = project.getSourceFile(path);
  if (src === undefined) {
    throw error.get(
      "Failed to load typescript module from ${path} while expecting a model",
      "file that contains an entity interface and registration for ${name}"
    );
  }
  const { entity, register } = ModelTraverser.run(name, error, src);

  // Collect inherited and locally declared entity properties.
  const props: PropertySignature[] = [];
  for (const b of entity.getBaseDeclarations().reverse()) {
    if (b instanceof InterfaceDeclaration) {
      props.push(...b.getProperties());
    } else if (b instanceof TypeAliasDeclaration) {
      const bi = b.getParentIfKind(SyntaxKind.InterfaceDeclaration);
      if (bi) {
        props.push(...bi.getProperties());
      }
    }
  }
  props.push(...entity.getProperties());

  // Parse entity properties into field specifications
  for (const p of props) {
    const r = parseType(error, p.getName(), p.getType(), p.getTypeNode());
    spec.fields.push(r.field);
    if (r.index) {
      spec.indexes.push(r.index);
    }
  }

  // Parse register call chain for entity configurations
  let daoReached = false;
  let p = getPropertyCall(register);
  while (p) {
    const r = parseConfigCall(error, p.name, p.call);
    if (r.index) {
      spec.indexes.push(r.index);
    }
    if (r.dao) {
      daoReached = true;
      p = undefined;
    } else {
      p = getPropertyCall(p.call);
    }
  }
  if (!daoReached) {
    throw error.get(
      "${modelMust} register the entity and configure a dao in one chain,",
      "${registerSample}"
    );
  }

  return spec;
}

function parseType(
  error: ModelErrorFactory,
  name: string,
  type: Type,
  node?: TypeNode,
): { field: EntityFieldSpec, index?: EntityIndexSpec } {
  if (node?.isKind(SyntaxKind.TypeReference)) {
    return parseTypeReference(
      error,
      name,
      type,
      node.asKindOrThrow(SyntaxKind.TypeReference)
    );
  }
  const base = { name, nullable: type.isNullable() };
  switch (node?.getKind()) {
    case SyntaxKind.StringKeyword:
      return { field: { ...base, type: "string" } };
    case SyntaxKind.BooleanKeyword:
      return { field: { ...base, type: "boolean" } };
    case SyntaxKind.NumberKeyword:
      return { field: { ...base, type: "double" } };
  }
  throw error.get(
    "${model} declares unsupported property type:",
    node?.getFullText() || "(missing)"
  );
}

function parseTypeReference(
  error: ModelErrorFactory,
  name: string,
  type: Type,
  node: TypeReferenceNode,
): { field: EntityFieldSpec, index?: EntityIndexSpec } {
  const base = { name, nullable: type.isNullable() };
  const tn = node.getTypeName().getText();
  const ta = getSingleTypeArgument(node);
  if (ta) {
    if (tn === "Indexed" || tn === "Unique") {
      return {
        index: { fields: [name], unique: tn === "Unique" },
        ...parseType(error, name, type.getApparentType(), ta),
      };
    } else if (tn === "Json") {
      return { field: { ...base, type: "string", json: true } };
    }
    const tra = ta.asKind(SyntaxKind.TypeReference);
    if (tra) {
      const rbase = {
        ...base,
        type: "long" as EntityFieldType,
        relationModel: tra.getTypeName().getText(),
      };
      switch (tn) {
        case "OneToOne":
          return { field: { ...rbase, relationType: "oneToOne" } };
        case "OneToOneReverse":
          return { field: { ...rbase, relationType: "oneToOneReverse" } };
        case "ManyToOne":
          return { field: { ...rbase, relationType: "manyToOne" } };
        case "OneToMany":
          return { field: { ...rbase, relationType: "manyToOneReverse" } };
        case "ManyToMany":
          return { field: { ...rbase, relationType: "manyToMany" } };
      }
    }
  } else if (type.isBoolean()) {
    return { field: { ...base, type: "boolean" } };
  } else if (type.isNumber()) {
    switch (tn) {
      case "Int":
        return { field: { ...base, type: "int" } };
      case "Long":
        return { field: { ...base, type: "long" } };
      case "Float":
        return { field: { ...base, type: "float" } };
      default:
        return { field: { ...base, type: "double" } };
    }
  } else if (type.isString()) {
    switch (tn) {
      case "Currency":
        return { field: { ...base, type: "currency" } };
      default:
        return { field: { ...base, type: "string" } };
    }
  } else if (type.getApparentType().getText() === "Date") {
    return { field: { ...base, type: "timestamp" } };
  }
  throw error.get(
    "${model} declares unsupported property type:",
    node.getFullText()
  );
}

function parseConfigCall(
  error: ModelErrorFactory,
  name: string,
  call: CallExpression
): { index?: EntityIndexSpec, dao?: boolean } {
  if (name === "index" || name === "uniqueIndex") {
    if (call.getArguments().length === 0) {
      throw error.get("${model} declares an index without any field names");
    }
    return {
      index: {
        fields: getStringArguments(call),
        unique: name === "uniqueIndex",
      }
    };
  } else if (name === "dao") {
    return { dao: true };
  }
  throw error.get("${model} register chain has unrecognized method:", name);
}
