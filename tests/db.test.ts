import { afterAll, expect, test } from "@jest/globals";
import { end, relation, reverse } from "../src";
import { organizationDao } from "./model/Organization";
import { treeNodeDao } from "./model/TreeNode";
import { userDao } from "./model/User";

test("Table is created and rows are managed", async () => {
  await userDao.deleteAll();
  const u = await userDao.create({
    name: "Taavetti",
    email: "tiptap@debyte.fi",
    password: "...",
    active: true,
  });
  expect(u.id).toBeDefined();
  expect(u.created).toBeDefined();
  u.email = "huh@debyte.fi";
  userDao.save(u);
  const users = await userDao.getAll();
  expect(users).toHaveLength(1);
  expect(users[0].id).toEqual(u.id);
  expect(users[0].created).toEqual(u.created);
  expect(users[0].email).toEqual(u.email);
});

test("Entity relations are managed", async () => {
  await organizationDao.deleteAll();
  await userDao.deleteAll();
  const o = await organizationDao.create({
    name: "Debyte",
    active: true,
    users: reverse(),
  });
  const u1 = await userDao.create({
    name: "TestUser",
    email: "testuser@debyte.fi",
    password: "...",
    active: true,
    organization: relation(o),
  });
  expect((await u1.organization?.get())?.name).toEqual(o.name);
  const u2 = await userDao.create({
    name: "FooUser",
    email: "foo@debyte.fi",
    password: "...",
    active: false,
  });
  u2.organization?.set(o);
  await userDao.save(u2);
  expect((await o.users.getAll())).toHaveLength(2);
});

test("Tree node relations are successful", async () => {
  await treeNodeDao.deleteAll();
  const p = await treeNodeDao.create({
    name: "Parent",
    data: { key: "ksdh" },
  });
  await treeNodeDao.create({
    name: "Child",
    data: {},
    parent: relation(p),
  });
  expect(await p.children?.getAll()).toHaveLength(1);
});

afterAll(async () => {
  await end();
});
