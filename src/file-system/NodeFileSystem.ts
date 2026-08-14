import { constants } from 'node:fs';
import { access, appendFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { ErrorWithCode } from './ErrorWithCode';
import type { FileSystem } from './FileSystem';


export class NodeFileSystem implements FileSystem {
    private static _isMissingFileError(error: unknown): error is ErrorWithCode {
        return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
    }

    public async exists(filePath: string): Promise<boolean> {
        try {
            await access(filePath, constants.F_OK);

            return true;
        } catch (error: unknown) {
            if (NodeFileSystem._isMissingFileError(error)) {
                return false;
            }

            throw error;
        }
    }

    public async readTextFile(filePath: string): Promise<string> {
        return readFile(filePath, 'utf8');
    }

    public async writeTextFile(filePath: string, content: string): Promise<void> {
        await writeFile(filePath, content, 'utf8');
    }

    public async appendTextFile(filePath: string, content: string): Promise<void> {
        await appendFile(filePath, content, 'utf8');
    }

    public async createDirectory(directoryPath: string): Promise<void> {
        await mkdir(directoryPath, { recursive: true });
    }

    public async createTemporaryDirectory(prefix: string): Promise<string> {
        return mkdtemp(join(tmpdir(), prefix));
    }

    public async move(sourcePath: string, destinationPath: string): Promise<void> {
        await rename(sourcePath, destinationPath);
    }

    public async removeFile(filePath: string): Promise<void> {
        await rm(filePath, { force: true });
    }
}
