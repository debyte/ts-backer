import { ModelError } from "../errors";
declare class ModelErrorFactory {
    name: string;
    path: string;
    constructor(name: string, path: string);
    get(...msg: string[]): ModelError;
    arg(name: string): string;
}
export default ModelErrorFactory;
