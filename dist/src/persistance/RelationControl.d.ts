import Entity from "../Entity";
import Relation from "../Relation";
import EntityFieldSpec from "../spec/EntityFieldSpec";
declare class RelationControl<T extends Entity> extends Relation<T> {
    private field;
    constructor(field: Required<EntityFieldSpec>, id?: string);
    get(): Promise<T | undefined>;
    set(related: T): void;
    unset(): void;
}
export default RelationControl;
