import Entity from "../Entity";
import Reverse from "../Reverse";
import EntityFieldSpec from "../spec/EntityFieldSpec";
import EntitySpec from "../spec/EntitySpec";
declare class ReverseAccess<T extends Entity> extends Reverse<T> {
    spec: EntitySpec;
    field: Required<EntityFieldSpec>;
    id?: string;
    constructor(spec: EntitySpec, field: Required<EntityFieldSpec>, id?: string);
    getOne(): Promise<T | undefined>;
    getAll(): Promise<T[]>;
}
export default ReverseAccess;
