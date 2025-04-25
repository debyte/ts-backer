import Entity from "./Entity";
declare class Relation<T extends Entity> {
    id?: string;
    constructor(related?: string | T);
    get(): Promise<T | undefined>;
    set(_related: T): void;
    unset(): void;
}
export default Relation;
