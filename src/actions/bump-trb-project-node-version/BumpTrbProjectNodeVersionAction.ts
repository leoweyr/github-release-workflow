import * as core from '@actions/core';

import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import { OctokitGitHubClient } from '../../github/OctokitGitHubClient';
import { TrbProjectNodeVersionBumper } from '../../publishing/trb/TrbProjectNodeVersionBumper';
import { InvalidTrbRepositoryError } from './exceptions/InvalidTrbRepositoryError';


export class BumpTrbProjectNodeVersionAction {
    private static _parseRepository(repositoryValue: string): GitHubRepositoryReference {
        const repositoryParts: string[] = repositoryValue.split('/');
        const owner: string | undefined = repositoryParts[0];
        const name: string | undefined = repositoryParts[1];

        if (
            repositoryParts.length !== 2
            || owner === undefined
            || owner.length === 0
            || name === undefined
            || name.length === 0
        ) {
            throw new InvalidTrbRepositoryError(repositoryValue);
        }

        return { owner, name };
    }

    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Bump TRB Project Node Version failed with a non-error value.');
    }

    public static async run(): Promise<void> {
        try {
            const repositoryValue: string = core.getInput('trb-repository');
            const projectNodeName: string = core.getInput('project-node-name');

            if (repositoryValue.length === 0 || projectNodeName.length === 0) {
                core.info(
                    'TRB project node version bump inputs are not fully configured. The operation is skipped.',
                );

                return;
            }

            const isPrerelease: boolean = core.getBooleanInput('prerelease', { required: true });
            if (isPrerelease) {
                core.info('TRB prerelease publishing is disabled. The operation is skipped.');

                return;
            }

            const accessToken: string = core.getInput('access-token', { required: true });

            core.setSecret(accessToken);

            const repository: GitHubRepositoryReference = BumpTrbProjectNodeVersionAction._parseRepository(
                repositoryValue,
            );

            const versionBumper: TrbProjectNodeVersionBumper = new TrbProjectNodeVersionBumper(
                new OctokitGitHubClient(accessToken),
            );

            await versionBumper.bump(
                repository,
                projectNodeName,
                core.getInput('release-version', { required: true }),
                core.getInput('release-at', { required: true }),
            );

            core.info(`Dispatched the TRB project node version bump for '${projectNodeName}'.`);
        } catch (error: unknown) {
            core.setFailed(BumpTrbProjectNodeVersionAction._toError(error));
        }
    }
}
