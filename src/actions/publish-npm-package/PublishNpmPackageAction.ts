import { resolve } from 'node:path';

import * as core from '@actions/core';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import type { CommandRunner } from '../../command/CommandRunner';
import type { FileSystem } from '../../file-system/FileSystem';
import { NodeFileSystem } from '../../file-system/NodeFileSystem';
import type { NpmPackageOverride } from '../../publishing/npm/NpmPackageOverride';
import { NpmPackageOverridesParser } from '../../publishing/npm/NpmPackageOverridesParser';
import { NpmPublishConfiguration } from '../../publishing/npm/NpmPublishConfiguration';
import type { NpmPublishSettings } from '../../publishing/npm/NpmPublishSettings';
import { PackageName } from '../../release/PackageName';
import { InvalidNpmPackagePublishingOperationError } from './exceptions/InvalidNpmPackagePublishingOperationError';
import { MissingNpmPackageFileError } from './exceptions/MissingNpmPackageFileError';


export class PublishNpmPackageAction {
    private static readonly _accessTokenEnvironment: string = 'NPM_PUBLISH_ACCESS_TOKEN';
    private static readonly _deployCommandEnvironment: string = 'NPM_PUBLISH_DEPLOY_COMMAND';
    private static readonly _nodeVersionEnvironment: string = 'NPM_PUBLISH_NODE_VERSION';
    private static readonly _packageDirectoryEnvironment: string = 'NPM_PUBLISH_PACKAGE_DIRECTORY';
    private static readonly _packageNameEnvironment: string = 'NPM_PUBLISH_PACKAGE_NAME';
    private static readonly _packageOverridesEnvironment: string = 'NPM_PUBLISH_PACKAGE_OVERRIDES';
    private static readonly _prepareOperation: string = 'prepare';
    private static readonly _publishOperation: string = 'publish';
    private static readonly _workingDirectoryEnvironment: string = 'NPM_PUBLISH_WORKING_DIRECTORY';

    private static _createConfiguration(): NpmPublishConfiguration {
        const packageOverrides: Readonly<Record<string, NpmPackageOverride>> = NpmPackageOverridesParser.parse(
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._packageOverridesEnvironment),
        );

        return new NpmPublishConfiguration(
            {
                nodeVersion: PublishNpmPackageAction._readEnvironment(
                    PublishNpmPackageAction._nodeVersionEnvironment,
                ),
                packageDirectory: PublishNpmPackageAction._readEnvironment(
                    PublishNpmPackageAction._packageDirectoryEnvironment,
                ),
                deployCommand: PublishNpmPackageAction._readEnvironment(
                    PublishNpmPackageAction._deployCommandEnvironment,
                ),
            },
            packageOverrides,
        );
    }

    private static _prepare(): void {
        const accessToken: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._accessTokenEnvironment,
        );

        if (accessToken.length === 0) {
            core.setOutput('enabled', 'false');
            core.info('NPM_TOKEN is not configured. NPM package publishing is skipped.');

            return;
        }

        core.setSecret(accessToken);

        const packageNameValue: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._packageNameEnvironment,
        );

        const packageName: PackageName | null = packageNameValue.length === 0
            ? null
            : PackageName.parse(packageNameValue);

        const settings: NpmPublishSettings = PublishNpmPackageAction._createConfiguration().resolve(packageName);

        core.setOutput('enabled', 'true');
        core.setOutput('node-version', settings.nodeVersion);
        core.setOutput('package-dir', settings.packageDirectory);
        core.setOutput('deploy-command', settings.deployCommand);
    }

    private static async _publish(commandRunner: CommandRunner, fileSystem: FileSystem): Promise<void> {
        const accessToken: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._accessTokenEnvironment,
        );

        core.setSecret(accessToken);

        const workingDirectory: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._workingDirectoryEnvironment,
        );

        const packageDirectory: string = resolve(
            workingDirectory,
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._packageDirectoryEnvironment),
        );

        const packageFilePath: string = resolve(packageDirectory, 'package.json');

        if (!await fileSystem.exists(packageFilePath)) {
            throw new MissingNpmPackageFileError(packageFilePath);
        }

        await commandRunner.execute('npm', ['ci'], {
            workingDirectory: packageDirectory,
        });

        const deployCommand: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._deployCommandEnvironment,
        );

        // Treat the deploy command as trusted workflow configuration while preventing token interpolation.
        await commandRunner.execute('bash', ['-e', '-o', 'pipefail', '-c', deployCommand], {
            workingDirectory: packageDirectory,
            environment: {
                NODE_AUTH_TOKEN: accessToken,
            },
        });

        core.info(`Published the NPM package from '${packageDirectory}'.`);
    }

    private static _readEnvironment(environmentName: string): string {
        return process.env[environmentName]?.trim() ?? '';
    }

    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Publish NPM Package failed with a non-error value.');
    }

    public static async run(
        commandRunner: CommandRunner = new ActionCommandRunner(),
        fileSystem: FileSystem = new NodeFileSystem(),
    ): Promise<void> {
        try {
            const operation: string | undefined = process.argv[2];

            if (operation === PublishNpmPackageAction._prepareOperation) {
                PublishNpmPackageAction._prepare();

                return;
            }

            if (operation === PublishNpmPackageAction._publishOperation) {
                await PublishNpmPackageAction._publish(commandRunner, fileSystem);

                return;
            }

            throw new InvalidNpmPackagePublishingOperationError(operation);
        } catch (error: unknown) {
            core.setFailed(PublishNpmPackageAction._toError(error));
        }
    }
}
