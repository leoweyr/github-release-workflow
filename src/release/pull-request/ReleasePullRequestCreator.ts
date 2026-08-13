import type { GitHubClient } from '../../github/GitHubClient';
import type { PullRequestReference } from '../../github/PullRequestReference';
import type { ReleasePullRequestCreationRequest } from './ReleasePullRequestCreationRequest';


export class ReleasePullRequestCreator {
    private static readonly _titlePrefix: string = 'release: ';

    private readonly _gitHubClient: GitHubClient;

    public constructor(gitHubClient: GitHubClient) {
        this._gitHubClient = gitHubClient;
    }

    public async create(request: ReleasePullRequestCreationRequest): Promise<PullRequestReference> {
        return this._gitHubClient.createPullRequest({
            repository: request.repository,
            title: `${ReleasePullRequestCreator._titlePrefix}${request.releaseTag.releaseLabel}`,
            body: request.body,
            baseBranch: request.baseBranch,
            headBranch: request.headBranch,
        });
    }

    public async createOrReuse(request: ReleasePullRequestCreationRequest): Promise<PullRequestReference> {
        const existingPullRequest: PullRequestReference | null = await this._gitHubClient.findOpenPullRequest({
            repository: request.repository,
            baseBranch: request.baseBranch,
            headBranch: request.headBranch,
        });

        if (existingPullRequest !== null) {
            return existingPullRequest;
        }

        return this.create(request);
    }
}
