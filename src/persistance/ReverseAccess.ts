import { cache } from "../cache";
import Entity from "../Entity";
import Reverse from "../Reverse";
import { reverseField } from "../spec";
import EntityFieldSpec from "../spec/EntityFieldSpec";
import EntitySpec from "../spec/EntitySpec";
import { first } from "../util/arrays";

class ReverseAccess<T extends Entity> extends Reverse<T> {
  spec: EntitySpec;
  field: Required<EntityFieldSpec>;
  id?: string;

  constructor(
    spec: EntitySpec,
    field: Required<EntityFieldSpec>,
    id?: string,
  ) {
    super();
    this.spec = spec;
    this.field = field;
    this.id = id;
  }

  async getOne(): Promise<T | undefined> {
    return first(await this.getAll());
  }

  async getAll(): Promise<T[]> {
    if (this.id) {
      const dao = cache.peek<T>(this.field.relationModel);
      const f = reverseField(dao.spec, this.spec, this.field);
      if (f) {
        return dao.getByField(f.name, this.id);
      }
    }
    return [];
  }
}

export default ReverseAccess;
