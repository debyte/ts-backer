import { register } from "../../src";
import Entity from "../../src/Entity";
import { Json, ManyToOneReverse } from "../../src/fields";
import { User } from "./User";

export interface Organization extends Entity {
  name: string;
  active: boolean;
  data?: Json<Record<string, unknown>>;
  users: ManyToOneReverse<User>;
}

export const organizationDao = register<Organization>("Organization").dao();
