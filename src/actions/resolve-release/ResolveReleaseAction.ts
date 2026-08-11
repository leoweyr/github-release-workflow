import * as core from '@actions/core';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import { CommandGitRepository } from '../../git/CommandGitRepository';
import type { ReleaseMetadata } from '../../release/resolution/ReleaseMetadata';
import { ReleaseMetadataResolver } from '../../release/resolution/ReleaseMetadataResolver';


export class ResolveReleaseAction {
    private static _setOutputs(releaseMetadata: ReleaseMetadata): void {
        core.setOutput('tag-name', releaseMetadata.tagName);
        core.setOutput('release-version', releaseMetadata.releaseVersion);
        core.setOutput('release-at', releaseMetadata.releaseAt);
        core.setOutput('package-name', releaseMetadata.packageName);
        core.setOutput('prerelease', releaseMetadata.prerelease);
    }

    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Resolve Release failed with a non-error value.');
    }

    public static async run(): Promise<void> {
        try {
            const workingDirectory: string = core.getInput('working-directory', { required: true });

            const releaseResolver: ReleaseMetadataResolver = new ReleaseMetadataResolver(
                new CommandGitRepository(new ActionCommandRunner(), workingDirectory),
            );

            const releaseMetadata: ReleaseMetadata = await releaseResolver.resolve(
                core.getInput('pull-request-title', { required: true }),
            );

            ResolveReleaseAction._setOutputs(releaseMetadata);

            core.info(`Resolved release metadata for '${releaseMetadata.tagName}'.`);
        } catch (error: unknown) {
            core.setFailed(ResolveReleaseAction._toError(error));
        }
    }
}
