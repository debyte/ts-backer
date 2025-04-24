import { register } from "../../src";
import Entity from "../../src/Entity";
import { Json, ManyToOne, Unique } from "../../src/fields";
import { Organization } from "./Organization";

export interface User extends Entity {
  name: string;
  email: Unique<string>;
  password: string;
  active: boolean;
  data?: Json<Record<string, unknown>>;
  organization?: ManyToOne<Organization>;
  test: Date;
}

export const userDao = register<User>("User")
  .index("name", "email")
  .dao();
