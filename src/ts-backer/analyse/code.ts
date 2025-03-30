import {
  CallExpression,
  Node,
  SyntaxKind,
  TypeNode,
  TypeReferenceNode,
} from "ts-morph";
import { PACKAGE } from "../constants";

export function isInProject(n: Node): boolean {
  return n.getSourceFile().getFilePath().includes(`${PACKAGE}/`);
}

export function isProjectId(n: Node | undefined, name: string): boolean {
  if (n && n.isKind(SyntaxKind.Identifier) && n.getText() === name) {
    const d = n.getDefinitionNodes();
    return d.length > 0 && isInProject(d.slice(-1)[0]);
  }
  return false;
}

export function getPropertyCall(n: Node): {
  name: string,
  call: CallExpression,
} | undefined {
  const pa = n.getParentIfKind(SyntaxKind.PropertyAccessExpression);
  if (pa && pa.getExpression() === n) {
    const call = pa.getParentIfKind(SyntaxKind.CallExpression);
    if (call && call.getExpression() === pa) {
      return {
        name: pa.getName(),
        call,
      };
    }
  }
  return undefined;
}

export function getStringArguments(call: CallExpression): string[] {
  return call.getArguments().map(a =>
    a.asKindOrThrow(SyntaxKind.StringLiteral).getText()
  );
}

export function getSingleTypeArgument(
  node: TypeReferenceNode
): TypeNode | undefined {
  const arg = node.getTypeArguments();
  return arg.length === 1 ? arg[0] : undefined;
}
