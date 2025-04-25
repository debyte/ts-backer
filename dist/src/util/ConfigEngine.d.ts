declare class ConfigEngine<T> {
    private name;
    private path;
    store: T;
    constructor(name: string, typing: T);
    read(): void;
    private loadFirstExisting;
    private makePath;
    write(): string;
    remove(): void;
}
export default ConfigEngine;
