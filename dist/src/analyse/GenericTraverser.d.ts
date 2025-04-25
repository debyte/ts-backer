import { Node, SyntaxKind } from "ts-morph";
declare class GenericTraverser {
    visitors: Map<SyntaxKind, (node: Node) => boolean>;
    traverse(node: Node): void;
}
export default GenericTraverser;
