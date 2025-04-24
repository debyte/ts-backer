import {
  CallExpression,
  InterfaceDeclaration,
  Node,
  SyntaxKind,
} from "ts-morph";
import { isInProject, isProjectId } from "./code";
import GenericTraverser from "./GenericTraverser";
import ModelErrorFactory from "./ModelErrorFactory";

class ModelTraverser extends GenericTraverser {
  name: string;
  error: ModelErrorFactory;
  entity: InterfaceDeclaration | undefined;
  register: CallExpression | undefined;

  static run(name: string, error: ModelErrorFactory, node: Node): {
    entity: InterfaceDeclaration;
    register: CallExpression;
  } {
    const tr = new ModelTraverser(name, error);
    tr.traverse(node);
    if (tr.entity === undefined) {
      throw error.get(
        "${modelMust} declare entity interface ${name}, ${interfaceSample}"
      );
    }
    if (tr.register === undefined) {
      throw error.get(
        "${modelMust} '${pkg}.register' the entity interface, ${registerSample}"
      );
    }
    return { entity: tr.entity, register: tr.register };
  }

  constructor(name: string, error: ModelErrorFactory) {
    super();
    this.name = name;
    this.error = error;
    this.visitors.set(
      SyntaxKind.InterfaceDeclaration,
      n => this.handleInterface(
        n.asKindOrThrow(SyntaxKind.InterfaceDeclaration)
      )
    );
    this.visitors.set(
      SyntaxKind.CallExpression,
      n => this.handleCall(n.asKindOrThrow(SyntaxKind.CallExpression))
    );
  }

  handleInterface(itf: InterfaceDeclaration): boolean {
    if (itf.getName() === this.name) {

      // Must extend Entity
      const ext = itf.getBaseDeclarations();
      const b = ext.length > 0 ? ext.slice(-1)[0] : undefined;
      if (!b || b.getName() !== "Entity" || !isInProject(b)) {
        throw this.error.get(
          "${modelMust} declare an interface that extends '${pkg}/Entity',",
          "${interfaceSample}"
        );
      }

      // Only declare once
      if (this.entity !== undefined) {
        throw this.error.get("${modelMust} declare a single model interface");
      }
      this.entity = itf;
    }
    return true;
  }

  handleCall(call: CallExpression): boolean {
    if (isProjectId(call.getFirstChild(), "register")) {

      // Must register with correct name and interface
      const targ = call.getTypeArguments();
      if (
        targ.length !== 1
        || !targ[0].isKind(SyntaxKind.TypeReference)
        || targ[0].getText() !== this.name
      ) {
        throw this.error.get(
          "${modelMust} register using type argument ${name}, ${registerSample}"
        );
      }
      const arg = call.getArguments();
      if (
        arg.length !== 1
        || !arg[0].isKind(SyntaxKind.StringLiteral)
        || arg[0].getText() !== `"${this.name}"`
      ) {
        throw this.error.get(
          "${modelMust} register using name ${name}, ${registerSample}"
        );
      }

      // Only register once
      if (this.register !== undefined) {
        throw this.error.get("${modelMust} register the declared entity once");
      }
      this.register = call;
    }
    return true;
  }
}

export default ModelTraverser;
