import { Entity } from "../../src";
import { Json, ManyToOne, ManyToOneReverse } from "../../src/fields";
export interface TreeNode extends Entity {
    name: string;
    data: Json<Record<string, string>>;
    parent?: ManyToOne<TreeNode>;
    children?: ManyToOneReverse<TreeNode>;
}
export declare const treeNodeDao: import("../../src/persistance/Dao").default<TreeNode>;
