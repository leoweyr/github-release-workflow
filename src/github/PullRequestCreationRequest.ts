import type { GitHubRepositoryReference } from './GitHubRepositoryReference';


export interface PullRequestCreationRequest {
    readonly repository: GitHubRepositoryReference;
    readonly title: string;
    readonly body: string;
    readonly baseBranch: string;
    readonly headBranch: string;
}
