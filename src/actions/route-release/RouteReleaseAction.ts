import * as core from '@actions/core';
import { context } from '@actions/github';

import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import { OctokitGitHubClient } from '../../github/OctokitGitHubClient';
import { ReleasePullRequestCreator } from '../../release/pull-request/ReleasePullRequestCreator';
import { RouteRelease } from '../../release/routing/RouteRelease';
import type { RouteReleaseResult } from '../../release/routing/RouteReleaseResult';


export class RouteReleaseAction {
    private static _toError(error: unknown): Error {
        if (error instanceof Error) {
            return error;
        }

        return new Error('Route Release failed with a non-error value.');
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

            const releaseRouter: RouteRelease = new RouteRelease(
                new ReleasePullRequestCreator(new OctokitGitHubClient(accessToken)),
            );

            const result: RouteReleaseResult = await releaseRouter.execute({
                repository,
                pullRequestTitle: core.getInput('pull-request-title', { required: true }),
                pullRequestBody: core.getInput('pull-request-body', { trimWhitespace: false }),
                baseBranch: core.getInput('base-branch', { required: true }),
                headBranch: core.getInput('head-branch', { required: true }),
                headRevision: core.getInput('head-revision', { required: true }),
                mainBranch: core.getInput('main-branch', { required: true }),
            });

            core.setOutput('publish-release', result.publishRelease);
            core.setOutput('release-history-revision', result.releaseHistoryRevision ?? '');

            if (result.promotionPullRequest !== null) {
                core.info(`Stable release promotion pull request: ${result.promotionPullRequest.url}`);

                return;
            }

            core.info('Release pull request routed to publication.');
        } catch (error: unknown) {
            core.setFailed(RouteReleaseAction._toError(error));
        }
    }
}
