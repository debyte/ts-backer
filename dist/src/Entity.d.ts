import { String, Timestamp } from "./fields";
/**
 * An entity can be persisted in a database and may be directly included in an
 * API offering create, read, update, and delete (CRUD) operations.
 */
interface Entity {
    id: String;
    created: Timestamp;
}
export default Entity;
