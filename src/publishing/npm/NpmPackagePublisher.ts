import { resolve } from 'node:path';

import type { CommandRunner } from '../../command/CommandRunner';
import type { FileSystem } from '../../file-system/FileSystem';
import { MissingNpmPackageFileError } from './exceptions/MissingNpmPackageFileError';


export class NpmPackagePublisher {
    private readonly _commandRunner: CommandRunner;
    private readonly _fileSystem: FileSystem;

    public constructor(commandRunner: CommandRunner, fileSystem: FileSystem) {
        this._commandRunner = commandRunner;
        this._fileSystem = fileSystem;
    }

    public async publish(
        workingDirectory: string,
        packageDirectoryValue: string,
        deployCommand: string,
        accessToken: string,
    ): Promise<string> {
        const packageDirectory: string = resolve(workingDirectory, packageDirectoryValue);
        const packageFilePath: string = resolve(packageDirectory, 'package.json');

        if (!await this._fileSystem.exists(packageFilePath)) {
            throw new MissingNpmPackageFileError(packageFilePath);
        }

        await this._commandRunner.execute('npm', ['ci'], {
            workingDirectory: packageDirectory,
        });

        // Treat the deploy command as trusted workflow configuration while preventing token interpolation.
        await this._commandRunner.execute('bash', ['-e', '-o', 'pipefail', '-c', deployCommand], {
            workingDirectory: packageDirectory,
            environment: {
                NODE_AUTH_TOKEN: accessToken,
            },
        });

        return packageDirectory;
    }
}
