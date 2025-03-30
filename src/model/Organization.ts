import { register } from "../ts-backer";
import Entity from "../ts-backer/Entity";
import { Json, ManyToMany } from "../ts-backer/fields";
import { User } from "./User";

export interface Organization extends Entity {
  name: string;
  active: boolean;
  data?: Json<Record<string, unknown>>;
  users: ManyToMany<User>;
}

export const OrganizationDao = register<Organization>("Organization").dao();

export default OrganizationDao;
