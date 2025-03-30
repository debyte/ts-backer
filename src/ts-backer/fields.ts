/**
 * Field types have little effect on the enclosed typescript data type
 * but they carry extra information for mapping data to persistance layer.
 */
export type String = string; // => psql text
export type Boolean = boolean; // => psql boolean
export type Int = number; // => psql int4
export type Long = number; // => psql int8
export type Float = number; // => psql real
export type Double = number; // => psql double (default for number)
export type Timestamp = Date; // => psql timestamp (without time zone)
export type Currency = string; // => psql money
// Add undefined for nullable field

// Mapping objects to json
export type Json<T> = T; // maps type => psql json

// Relationships (foreign keys)
export type OneToOne<T> = T; // => psql int8 foreign key field
export type OneToOneReverse<T> = T; // => reverse, requires OneToOne in other
export type ManyToOne<T> = T; // => psql int8 foreign key field
export type OneToMany<T> = T[]; // => reverse, requires ManyToOne in other
export type ManyToMany<T> = T[]; // => psql join table, at one or both ends

// Indexing (multi-key indexes are available in register call)
export type Indexed<T> = T;
export type Unique<T> = T;
