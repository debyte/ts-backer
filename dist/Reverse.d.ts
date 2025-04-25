import Entity from "./Entity";
declare class Reverse<T extends Entity> {
    getOne(): Promise<T | undefined>;
    getAll(): Promise<T[]>;
}
export default Reverse;
