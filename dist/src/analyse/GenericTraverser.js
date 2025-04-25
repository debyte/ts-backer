"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GenericTraverser {
    constructor() {
        this.visitors = new Map();
    }
    traverse(node) {
        for (const child of node.getChildren()) {
            const visit = this.visitors.get(child.getKind());
            if (visit === undefined || visit(child)) {
                this.traverse(child);
            }
        }
    }
}
exports.default = GenericTraverser;
