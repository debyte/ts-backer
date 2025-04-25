"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const src_1 = require("../src");
const Organization_1 = require("./model/Organization");
const TreeNode_1 = require("./model/TreeNode");
const User_1 = require("./model/User");
(0, globals_1.test)("Table is created and rows are managed", async () => {
    await User_1.userDao.deleteAll();
    const u = await User_1.userDao.create({
        name: "Taavetti",
        email: "tiptap@debyte.fi",
        password: "...",
        active: true,
    });
    (0, globals_1.expect)(u.id).toBeDefined();
    (0, globals_1.expect)(u.created).toBeDefined();
    u.email = "huh@debyte.fi";
    User_1.userDao.save(u);
    const users = await User_1.userDao.getAll();
    (0, globals_1.expect)(users).toHaveLength(1);
    (0, globals_1.expect)(users[0].id).toEqual(u.id);
    (0, globals_1.expect)(users[0].created).toEqual(u.created);
    (0, globals_1.expect)(users[0].email).toEqual(u.email);
});
(0, globals_1.test)("Entity relations are managed", async () => {
    await Organization_1.organizationDao.deleteAll();
    await User_1.userDao.deleteAll();
    const o = await Organization_1.organizationDao.create({
        name: "Debyte",
        active: true,
        users: (0, src_1.reverse)(),
    });
    const u1 = await User_1.userDao.create({
        name: "TestUser",
        email: "testuser@debyte.fi",
        password: "...",
        active: true,
        organization: (0, src_1.relation)(o),
    });
    (0, globals_1.expect)((await u1.organization?.get())?.name).toEqual(o.name);
    const u2 = await User_1.userDao.create({
        name: "FooUser",
        email: "foo@debyte.fi",
        password: "...",
        active: false,
    });
    u2.organization?.set(o);
    await User_1.userDao.save(u2);
    (0, globals_1.expect)((await o.users.getAll())).toHaveLength(2);
});
(0, globals_1.test)("Tree node relations are successful", async () => {
    await TreeNode_1.treeNodeDao.deleteAll();
    const p = await TreeNode_1.treeNodeDao.create({
        name: "Parent",
        data: { key: "ksdh" },
    });
    await TreeNode_1.treeNodeDao.create({
        name: "Child",
        data: {},
        parent: (0, src_1.relation)(p),
    });
    (0, globals_1.expect)(await p.children?.getAll()).toHaveLength(1);
});
(0, globals_1.afterAll)(async () => {
    await (0, src_1.end)();
});
