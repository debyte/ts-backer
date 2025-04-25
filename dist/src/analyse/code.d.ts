import { CallExpression, Node, TypeNode, TypeReferenceNode } from "ts-morph";
export declare function isInProject(n: Node): boolean;
export declare function isProjectId(n: Node | undefined, name: string): boolean;
export declare function getPropertyCall(n: Node): {
    name: string;
    call: CallExpression;
} | undefined;
export declare function getStringArguments(call: CallExpression): string[];
export declare function getSingleTypeArgument(node: TypeReferenceNode): TypeNode | undefined;
