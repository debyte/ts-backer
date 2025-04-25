import { Entity, register } from "../../src";
import { Json, ManyToOne, ManyToOneReverse } from "../../src/fields";

export interface TreeNode extends Entity {
  name: string;
  data: Json<Record<string, string>>;
  parent?: ManyToOne<TreeNode>;
  children?: ManyToOneReverse<TreeNode>;
}

export const treeNodeDao = register<TreeNode>("TreeNode").dao();
