# ts-backer

Effortless, simple backend services for TypeScript projects with minimal
boilerplate code and helpful typing. Features include:

* Automated PostgreSQL persistance for declared entities
* TODO: Automated create, read, update, and delete UI components for
  declared entities
* TODO: An optional system for user management, authorization, sessions,
  access control, and history record

## Persistance example

1. Declare entities
```ts
// src/model/TreeNode.ts
import { Entity, register } from "ts-backer";
import { Json, ManyToOne, ManyToOneReverse } from "ts-backer/fields";

export interface TreeNode extends Entity {
  name: string;
  data: Json<Record<string, string>>;
  parent?: ManyToOne<TreeNode>;
  children?: ManyToOneReverse<TreeNode>;
}

export const treeNodeDao = register<TreeNode>("TreeNode").dao();
```
2. Use the DAO to persist and look up entities.
```ts
// src/App.ts
import { relation } from "ts-backer";
import { treeNodeDao } from "./model/TreeNode";

async function makeTree() {

  // The database is auto-migrated according to entity declaration.
  // Types guide for the required and optional entity fields.
  const parent = await treeNodeDao.create({
    name: "Parent",
    data: { key: "ksdh" },
  });

  // Relations use a simple wrapping function at create time.
  await treeNodeDao.create({
    name: "Child",
    data: {},
    parent: relation(root),
  });

  // Persisted relations offer access as typed methods.
  const children = parent.children!.getAll();
}
```
