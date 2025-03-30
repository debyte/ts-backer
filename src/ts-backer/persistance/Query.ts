import Entity from "../Entity";

interface Query<T extends Entity> {
  select(): Query<T>;
  where(): Query<T>;
  sort(): Query<T>;
  limit(): Query<T>;
  results(): T[];
}

export default Query;
