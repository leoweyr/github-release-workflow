import type { PullRequestCreationRequest } from './PullRequestCreationRequest';
import type { PullRequestReference } from './PullRequestReference';
import type { PullRequestSearchRequest } from './PullRequestSearchRequest';
import type { GitHubReleaseCreationRequest } from './GitHubReleaseCreationRequest';
import type { GitHubReleaseReference } from './GitHubReleaseReference';
import type { GitHubRepositoryReference } from './GitHubRepositoryReference';
import type { WorkflowDispatchRequest } from './WorkflowDispatchRequest';


export interface GitHubClient {
    createPullRequest(request: PullRequestCreationRequest): Promise<PullRequestReference>;
    findOpenPullRequest(request: PullRequestSearchRequest): Promise<PullRequestReference | null>;
    findPullRequest(request: PullRequestSearchRequest): Promise<PullRequestReference | null>;
    createRelease(request: GitHubReleaseCreationRequest): Promise<GitHubReleaseReference>;
    getReleaseByTag(
        repository: GitHubRepositoryReference,
        tagName: string,
    ): Promise<GitHubReleaseReference | null>;
    getDefaultBranch(repository: GitHubRepositoryReference): Promise<string>;
    dispatchWorkflow(request: WorkflowDispatchRequest): Promise<void>;
}
