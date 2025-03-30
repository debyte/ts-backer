import { Long, Timestamp } from "./fields";

/**
 * An entity can be persisted in a database and may be directly included in an
 * API offering create, read, update, and delete (CRUD) operations.
 */
interface Entity {
  id: Long; // => psql primary key serial
  created: Timestamp; // => psql default now()
}

export default Entity;
