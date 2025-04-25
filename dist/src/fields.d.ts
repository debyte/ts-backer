import Entity from "./Entity";
import Relation from "./Relation";
import Reverse from "./Reverse";
/**
 * The primitive types can be used directly too.
 * The types defined here may help to clarify what is supported.
 *
 * To make a field nullable, use `name?` for optional property
 * or add `| undefined` to type.
 */
export type String = string;
export type Number = number;
export type Boolean = boolean;
export type Timestamp = Date;
/**
 * Compatible types can be stored using generic json type.
 */
export type Json<T> = T;
/**
 * Mark indexed fields (multi-key indexes are available in register call).
 */
export type Indexed<T> = T;
export type Unique<T> = T;
/**
 * Relationships between models are declared using generic types.
 *
 * Reverse fields require a counterpart in the related typed model.
 *
 * For many-to-many, create a link model having `ManyToOne` for both parties.
 */
export type OneToOne<T extends Entity> = Relation<T>;
export type ManyToOne<T extends Entity> = Relation<T>;
export type OneToOneReverse<T extends Entity> = Reverse<T>;
export type ManyToOneReverse<T extends Entity> = Reverse<T>;
