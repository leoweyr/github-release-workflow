import * as core from '@actions/core';
import { context } from '@actions/github';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import { NodeFileSystem } from '../../file-system/NodeFileSystem';
import { CommandGitCliffClient } from '../../git-cliff/CommandGitCliffClient';
import { CommandGitRepository } from '../../git/CommandGitRepository';
import type { GitAuthor } from '../../git/GitAuthor';
import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import { OctokitGitHubClient } from '../../github/OctokitGitHubClient';
import { PrepareRelease } from '../../preparation/PrepareRelease';
import type { PrepareReleaseRequest } from '../../preparation/PrepareReleaseRequest';
import type { PrepareReleaseResult } from '../../preparation/PrepareReleaseResult';
import { PackageWorkspaceCatalog } from '../../release/PackageWorkspaceCatalog';
import type { PackageWorkspaceRecord } from '../../release/PackageWorkspaceCatalog';
import { ReleasePullRequestCreator } from '../../release/pull-request/ReleasePullRequestCreator';
import { InvalidPackageWorkspacesError } from './exceptions/InvalidPackageWorkspacesError';


export class PrepareReleaseAction {
    private static _isStringRecord(value: unknown): value is Record<string, string> {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return false;
        }

        return Object.values(value).every((entry: unknown): boolean => typeof entry === 'string');
    }

    private static _parsePackageWorkspaces(serializedWorkspaces: string): PackageWorkspaceCatalog {
        let parsedWorkspaces: unknown;

        try {
            parsedWorkspaces = JSON.parse(serializedWorkspaces) as unknown;
        } catch (error: unknown) {
            const reason: string = error instanceof Error ? error.message : 'the value is not valid JSON';

            throw new InvalidPackageWorkspacesError(reason);
        }

        if (!PrepareReleaseAction._isStringRecord(parsedWorkspaces)) {
            throw new InvalidPackageWorkspacesError('the top-level value must be an object of string values');
        }

        const packageWorkspaces: PackageWorkspaceRecord = parsedWorkspaces;

        return new PackageWorkspaceCatalog(packageWorkspaces);
    }

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

        return new Error('Prepare Release failed with a non-error value.');
    }

    public static async run(): Promise<void> {
        try {
            const accessToken: string = core.getInput('access-token', { required: true });

            core.setSecret(accessToken);

            const repositoryContext: { owner: string; repo: string } = context.repo;

            const repository: GitHubRepositoryReference = {
                owner: repositoryContext.owner,
                name: repositoryContext.repo,
            };

            const workingDirectory: string = core.getInput('working-directory', { required: true });
            const commandRunner: ActionCommandRunner = new ActionCommandRunner();
            const gitHubClient: OctokitGitHubClient = new OctokitGitHubClient(accessToken);

            const request: PrepareReleaseRequest = {
                tagName: core.getInput('tag-name', { required: true }),
                repository,
                author: PrepareReleaseAction._readAuthor(),
                packageWorkspaces: PrepareReleaseAction._parsePackageWorkspaces(
                    core.getInput('packages', { required: true }),
                ),
                changelogConfigurationPath: core.getInput('changelog-configuration-path', { required: true }),
                gitCliffEnvironment: {
                    GITHUB_REPO: `${repository.owner}/${repository.name}`,
                    GITHUB_TOKEN: accessToken,
                },
            };

            const prepareRelease: PrepareRelease = new PrepareRelease(
                new NodeFileSystem(),
                new CommandGitCliffClient(commandRunner),
                new CommandGitRepository(commandRunner, workingDirectory),
                new ReleasePullRequestCreator(gitHubClient),
                workingDirectory,
            );

            const result: PrepareReleaseResult = await prepareRelease.execute(request);

            core.info(`Created release pull request '${result.pullRequest.url}'.`);
        } catch (error: unknown) {
            core.setFailed(PrepareReleaseAction._toError(error));
        }
    }
}
