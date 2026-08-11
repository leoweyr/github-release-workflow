import { getOctokit } from '@actions/github';

import type { GitHubClient } from './GitHubClient';
import type { ErrorWithStatus } from './octokit/ErrorWithStatus';
import type { ReleaseData } from './octokit/ReleaseData';
import type { GitHubReleaseReference } from './GitHubReleaseReference';
import type { OctokitApi } from './octokit/OctokitApi';
import type { OctokitFactory } from './octokit/OctokitFactory';
import type { PullRequestCreationRequest } from './PullRequestCreationRequest';
import type { PullRequestReference } from './PullRequestReference';
import type { OctokitResponse } from './octokit/OctokitResponse';
import type { PullRequestData } from './octokit/PullRequestData';
import type { PullRequestSearchRequest } from './PullRequestSearchRequest';
import type { GitHubReleaseCreationRequest } from './GitHubReleaseCreationRequest';
import type { GitHubRepositoryReference } from './GitHubRepositoryReference';
import type { RepositoryData } from './octokit/RepositoryData';
import type { WorkflowDispatchRequest } from './WorkflowDispatchRequest';


export class OctokitGitHubClient implements GitHubClient {
    private static readonly _notFoundStatus: number = 404;

    private static _isNotFoundError(error: unknown): error is ErrorWithStatus {
        return (
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            error.status === OctokitGitHubClient._notFoundStatus
        );
    }

    private static _toReleaseReference(release: ReleaseData): GitHubReleaseReference {
        return {
            identifier: release.id,
            url: release.html_url,
            tagName: release.tag_name,
            title: release.name,
            body: release.body ?? null,
            draft: release.draft,
            prerelease: release.prerelease,
        };
    }

    private static _toPullRequestReference(
        pullRequests: readonly PullRequestData[],
    ): PullRequestReference | null {
        const pullRequest: PullRequestData | undefined = pullRequests[0];

        if (pullRequest === undefined) {
            return null;
        }

        return {
            number: pullRequest.number,
            url: pullRequest.html_url,
        };
    }

    private readonly _octokit: OctokitApi;

    public constructor(accessToken: string, octokitFactory: OctokitFactory = getOctokit) {
        this._octokit = octokitFactory(accessToken);
    }

    public async createPullRequest(request: PullRequestCreationRequest): Promise<PullRequestReference> {
        const response: OctokitResponse<PullRequestData> = await this._octokit.rest.pulls.create({
            owner: request.repository.owner,
            repo: request.repository.name,
            title: request.title,
            body: request.body,
            base: request.baseBranch,
            head: request.headBranch,
        });

        return {
            number: response.data.number,
            url: response.data.html_url,
        };
    }

    public async findOpenPullRequest(request: PullRequestSearchRequest): Promise<PullRequestReference | null> {
        const response: OctokitResponse<readonly PullRequestData[]> = await this._octokit.rest.pulls.list({
            owner: request.repository.owner,
            repo: request.repository.name,
            state: 'open',
            base: request.baseBranch,
            head: `${request.repository.owner}:${request.headBranch}`,
            per_page: 1,
        });

        return OctokitGitHubClient._toPullRequestReference(response.data);
    }

    public async findPullRequest(request: PullRequestSearchRequest): Promise<PullRequestReference | null> {
        const response: OctokitResponse<readonly PullRequestData[]> = await this._octokit.rest.pulls.list({
            owner: request.repository.owner,
            repo: request.repository.name,
            state: 'all',
            base: request.baseBranch,
            head: `${request.repository.owner}:${request.headBranch}`,
            per_page: 1,
        });

        return OctokitGitHubClient._toPullRequestReference(response.data);
    }

    public async createRelease(request: GitHubReleaseCreationRequest): Promise<GitHubReleaseReference> {
        const baseParameters: {
            readonly owner: string;
            readonly repo: string;
            readonly tag_name: string;
            readonly name: string;
            readonly body: string;
            readonly draft: boolean;
            readonly prerelease: boolean;
        } = {
            owner: request.repository.owner,
            repo: request.repository.name,
            tag_name: request.tagName,
            name: request.title,
            body: request.body,
            draft: request.draft,
            prerelease: request.prerelease,
        };

        let response: OctokitResponse<ReleaseData>;

        if (request.makeLatest === undefined) {
            response = await this._octokit.rest.repos.createRelease(baseParameters);
        } else {
            response = await this._octokit.rest.repos.createRelease({
                ...baseParameters,
                make_latest: request.makeLatest,
            });
        }

        return OctokitGitHubClient._toReleaseReference(response.data);
    }

    public async getReleaseByTag(
        repository: GitHubRepositoryReference,
        tagName: string,
    ): Promise<GitHubReleaseReference | null> {
        try {
            const response: OctokitResponse<ReleaseData> = await this._octokit.rest.repos.getReleaseByTag({
                owner: repository.owner,
                repo: repository.name,
                tag: tagName,
            });

            return OctokitGitHubClient._toReleaseReference(response.data);
        } catch (error: unknown) {
            if (OctokitGitHubClient._isNotFoundError(error)) {
                return null;
            }

            throw error;
        }
    }

    public async getDefaultBranch(repository: GitHubRepositoryReference): Promise<string> {
        const response: OctokitResponse<RepositoryData> = await this._octokit.rest.repos.get({
            owner: repository.owner,
            repo: repository.name,
        });

        return response.data.default_branch;
    }

    public async dispatchWorkflow(request: WorkflowDispatchRequest): Promise<void> {
        const baseParameters: {
            readonly owner: string;
            readonly repo: string;
            readonly workflow_id: string;
            readonly ref: string;
        } = {
            owner: request.repository.owner,
            repo: request.repository.name,
            workflow_id: request.workflowIdentifier,
            ref: request.reference,
        };

        if (request.inputs === undefined) {
            await this._octokit.rest.actions.createWorkflowDispatch(baseParameters);

            return;
        }

        await this._octokit.rest.actions.createWorkflowDispatch({
            ...baseParameters,
            inputs: { ...request.inputs },
        });
    }
}
