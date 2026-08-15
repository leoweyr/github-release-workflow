import * as core from '@actions/core';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import { CommandGitRepository } from '../../git/CommandGitRepository';
import type { GitAuthor } from '../../git/GitAuthor';
import type { ReleaseChangelogSynchronizationResult } from '../../publishing/changelog/ReleaseChangelogSynchronizationResult';
import { ReleaseChangelogSynchronizer } from '../../publishing/changelog/ReleaseChangelogSynchronizer';


export class SyncReleaseChangelogAction {
    private static _readAuthor(): GitAuthor {
        return {
            name: core.getInput('commit-user-name', { required: true }),
            email: core.getInput('commit-user-email', { required: true }),
        };
    }

    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Sync Release Changelog failed with a non-error value.');
    }

    public static async run(): Promise<void> {
        try {
            const releaseChangelogSynchronizer: ReleaseChangelogSynchronizer = new ReleaseChangelogSynchronizer(
                new CommandGitRepository(
                    new ActionCommandRunner(),
                    core.getInput('working-directory', { required: true }),
                ),
            );

            const result: ReleaseChangelogSynchronizationResult = await releaseChangelogSynchronizer.synchronize({
                author: SyncReleaseChangelogAction._readAuthor(),
                developmentBranch: core.getInput('development-branch', { required: true }),
                releaseBranch: core.getInput('release-branch', { required: true }),
                releaseCommitSubject: core.getInput('release-commit-subject', { required: true }),
                releaseRevision: core.getInput('release-revision', { required: true }),
            });

            if (!result.synchronized) {
                core.info(
                    `Release changelog commit '${result.commitHash}' is already present on the development branch.`,
                );

                return;
            }

            core.info(`Synchronized release changelog commit '${result.commitHash}' to the development branch.`);
        } catch (error: unknown) {
            core.setFailed(SyncReleaseChangelogAction._toError(error));
        }
    }
}
