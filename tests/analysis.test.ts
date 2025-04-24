import { afterAll, expect, test } from "@jest/globals";
import { userDao } from "./model/User";
import { sql } from "../src/persistance";

test("Model is analysed", async () => {
  expect(await userDao.get("0")).toBeUndefined();

});

afterAll(async () => {
  await sql.end();
});
