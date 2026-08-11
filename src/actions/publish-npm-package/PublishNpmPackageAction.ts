import * as core from '@actions/core';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import type { CommandRunner } from '../../command/CommandRunner';
import type { FileSystem } from '../../file-system/FileSystem';
import { NodeFileSystem } from '../../file-system/NodeFileSystem';
import type { NpmPackageOverride } from '../../publishing/npm/NpmPackageOverride';
import { NpmPackageOverridesParser } from '../../publishing/npm/NpmPackageOverridesParser';
import { NpmPackagePublisher } from '../../publishing/npm/NpmPackagePublisher';
import { NpmPublishConfiguration } from '../../publishing/npm/NpmPublishConfiguration';
import type { NpmPublishSettings } from '../../publishing/npm/NpmPublishSettings';
import { PackageName } from '../../release/PackageName';
import { SemanticVersion } from '../../release/SemanticVersion';


export class PublishNpmPackageAction {
    private static readonly _accessTokenEnvironment: string = 'NPM_PUBLISH_ACCESS_TOKEN';
    private static readonly _deployCommandEnvironment: string = 'NPM_PUBLISH_DEPLOY_COMMAND';
    private static readonly _distTagEnvironment: string = 'NPM_PUBLISH_DIST_TAG';
    private static readonly _nodeVersionEnvironment: string = 'NPM_PUBLISH_NODE_VERSION';
    private static readonly _packageDirectoryEnvironment: string = 'NPM_PUBLISH_PACKAGE_DIRECTORY';
    private static readonly _packageNameEnvironment: string = 'NPM_PUBLISH_PACKAGE_NAME';
    private static readonly _packageOverridesEnvironment: string = 'NPM_PUBLISH_PACKAGE_OVERRIDES';
    private static readonly _releaseVersionEnvironment: string = 'NPM_PUBLISH_RELEASE_VERSION';
    private static readonly _workingDirectoryEnvironment: string = 'NPM_PUBLISH_WORKING_DIRECTORY';

    private static _createConfiguration(): NpmPublishConfiguration {
        const packageOverrides: Readonly<Record<string, NpmPackageOverride>> = NpmPackageOverridesParser.parse(
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._packageOverridesEnvironment),
        );

        const releaseVersion: SemanticVersion = SemanticVersion.parse(
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._releaseVersionEnvironment),
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
                distTag: releaseVersion.isPrerelease ? 'next' : 'latest',
            },
            packageOverrides,
        );
    }

    private static _prepare(): void {
        const accessToken: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._accessTokenEnvironment,
        );

        if (accessToken.length === 0) {
            core.setOutput('enabled', false);
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

        core.setOutput('enabled', true);
        core.setOutput('node-version', settings.nodeVersion);
        core.setOutput('package-dir', settings.packageDirectory);
        core.setOutput('deploy-command', settings.deployCommand);
        core.setOutput('dist-tag', settings.distTag);
    }

    private static async _publish(commandRunner: CommandRunner, fileSystem: FileSystem): Promise<void> {
        const accessToken: string = PublishNpmPackageAction._readEnvironment(
            PublishNpmPackageAction._accessTokenEnvironment,
        );

        core.setSecret(accessToken);

        const publisher: NpmPackagePublisher = new NpmPackagePublisher(commandRunner, fileSystem);
        const packageDirectory: string = await publisher.publish(
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._workingDirectoryEnvironment),
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._packageDirectoryEnvironment),
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._deployCommandEnvironment),
            PublishNpmPackageAction._readEnvironment(PublishNpmPackageAction._distTagEnvironment),
            accessToken,
        );

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

            if (operation === 'prepare') {
                PublishNpmPackageAction._prepare();

                return;
            }

            if (operation === 'publish') {
                await PublishNpmPackageAction._publish(commandRunner, fileSystem);

                return;
            }

            throw new Error(`NPM package publishing operation '${operation ?? ''}' is not supported.`);
        } catch (error: unknown) {
            core.setFailed(PublishNpmPackageAction._toError(error));
        }
    }
}
