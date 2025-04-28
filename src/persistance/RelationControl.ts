import { cache } from "../cache";
import Entity from "../Entity";
import Relation from "../Relation";
import EntityFieldSpec from "../spec/EntityFieldSpec";

class RelationControl<T extends Entity> extends Relation<T> {
  private field: Required<EntityFieldSpec>;

  constructor(field: Required<EntityFieldSpec>, id?: string) {
    super(id);
    this.field = field;
  }

  async get(): Promise<T | undefined> {
    if (this.id !== undefined) {
      return cache.peek<T>(this.field.relationModel).get(this.id);
    }
    return undefined;
  }

  set(related: T) {
    this.id = related.id;
  }

  unset() {
    this.id = undefined;
  }
}

export default RelationControl;
