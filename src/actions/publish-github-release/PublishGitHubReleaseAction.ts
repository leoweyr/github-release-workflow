import * as core from '@actions/core';
import { context } from '@actions/github';

import { ActionCommandRunner } from '../../command/ActionCommandRunner';
import { CommandGitRepository } from '../../git/CommandGitRepository';
import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import { OctokitGitHubClient } from '../../github/OctokitGitHubClient';
import type { GitHubReleasePublication } from '../../publishing/github/GitHubReleasePublication';
import { GitHubReleasePublisher } from '../../publishing/github/GitHubReleasePublisher';
import { ReleaseTag } from '../../release/ReleaseTag';
import { InvalidReleasePullRequestTitleError } from './exceptions/InvalidReleasePullRequestTitleError';
import { UnmergedReleasePullRequestError } from './exceptions/UnmergedReleasePullRequestError';


export class PublishGitHubReleaseAction {
    private static readonly _releaseTitlePrefix: string = 'release: ';

    private static _parseReleaseTag(pullRequestTitle: string): ReleaseTag {
        if (!pullRequestTitle.startsWith(PublishGitHubReleaseAction._releaseTitlePrefix)) {
            throw new InvalidReleasePullRequestTitleError(pullRequestTitle);
        }

        const releaseLabel: string = pullRequestTitle.slice(PublishGitHubReleaseAction._releaseTitlePrefix.length);

        return ReleaseTag.fromReleaseLabel(releaseLabel);
    }

    private static _setOutputs(
        releaseTag: ReleaseTag,
        githubPublication: GitHubReleasePublication,
    ): void {
        core.setOutput('tag-name', releaseTag.tagName);
        core.setOutput('release-version', releaseTag.version.value);
        core.setOutput('release-title', releaseTag.releaseTitle);
        core.setOutput('release-at', githubPublication.releaseAt);
        core.setOutput('package-name', releaseTag.packageName?.value ?? '');
        core.setOutput('github-release-url', githubPublication.reference.url);
    }

    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Publish GitHub Release failed with a non-error value.');
    }

    public static async run(): Promise<void> {
        try {
            const pullRequestMerged: boolean = core.getBooleanInput('pull-request-merged', { required: true });

            if (!pullRequestMerged) {
                throw new UnmergedReleasePullRequestError();
            }

            const accessToken: string = core.getInput('access-token', { required: true });

            core.setSecret(accessToken);

            const pullRequestTitle: string = core.getInput('pull-request-title', { required: true });
            const releaseTag: ReleaseTag = PublishGitHubReleaseAction._parseReleaseTag(pullRequestTitle);
            const repositoryContext: { owner: string; repo: string } = context.repo;

            const repository: GitHubRepositoryReference = {
                owner: repositoryContext.owner,
                name: repositoryContext.repo,
            };

            const commandRunner: ActionCommandRunner = new ActionCommandRunner();
            const gitRepository: CommandGitRepository = new CommandGitRepository(
                commandRunner,
                core.getInput('working-directory', { required: true }),
            );

            const githubReleasePublisher: GitHubReleasePublisher = new GitHubReleasePublisher(
                gitRepository,
                new OctokitGitHubClient(accessToken),
            );

            const githubPublication: GitHubReleasePublication = await githubReleasePublisher.publish(
                repository,
                releaseTag,
                core.getInput('release-body', { trimWhitespace: false }),
            );

            PublishGitHubReleaseAction._setOutputs(releaseTag, githubPublication);

            core.info(`Created GitHub Release '${releaseTag.releaseTitle}': ${githubPublication.reference.url}`);
        } catch (error: unknown) {
            core.setFailed(PublishGitHubReleaseAction._toError(error));
        }
    }
}
