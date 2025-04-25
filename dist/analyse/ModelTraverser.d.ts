import { CallExpression, InterfaceDeclaration, Node } from "ts-morph";
import GenericTraverser from "./GenericTraverser";
import ModelErrorFactory from "./ModelErrorFactory";
declare class ModelTraverser extends GenericTraverser {
    name: string;
    error: ModelErrorFactory;
    entity: InterfaceDeclaration | undefined;
    register: CallExpression | undefined;
    static run(name: string, error: ModelErrorFactory, node: Node): {
        entity: InterfaceDeclaration;
        register: CallExpression;
    };
    constructor(name: string, error: ModelErrorFactory);
    handleInterface(itf: InterfaceDeclaration): boolean;
    handleCall(call: CallExpression): boolean;
}
export default ModelTraverser;
