import { Node, SyntaxKind } from "ts-morph";

class GenericTraverser {
  visitors: Map<SyntaxKind, (node: Node) => boolean> = new Map();

  traverse(node: Node) {
    for (const child of node.getChildren()) {
      const visit = this.visitors.get(child.getKind());
      if (visit === undefined || visit(child)) {
        this.traverse(child);
      }
    }
  }
}

export default GenericTraverser;
