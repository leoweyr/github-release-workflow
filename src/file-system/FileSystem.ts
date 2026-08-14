export interface FileSystem {
    exists(filePath: string): Promise<boolean>;
    readTextFile(filePath: string): Promise<string>;
    writeTextFile(filePath: string, content: string): Promise<void>;
    appendTextFile(filePath: string, content: string): Promise<void>;
    createDirectory(directoryPath: string): Promise<void>;
    createTemporaryDirectory(prefix: string): Promise<string>;
    move(sourcePath: string, destinationPath: string): Promise<void>;
    removeFile(filePath: string): Promise<void>;
}
