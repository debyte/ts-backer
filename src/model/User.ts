import { register } from "../ts-backer";
import Entity from "../ts-backer/Entity";
import { Json, ManyToMany, Unique } from "../ts-backer/fields";
import { Organization } from "./Organization";

export interface User extends Entity {
  name: string;
  email: Unique<string>;
  password: string;
  active: boolean;
  data?: Json<Record<string, unknown>>;
  organizations: ManyToMany<Organization>;
  test: Date;
}

export const UserDao = register<User>("User")
  .index("name", "email")
  .dao();

export default UserDao;
