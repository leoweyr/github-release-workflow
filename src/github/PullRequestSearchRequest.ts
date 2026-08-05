import type { GitHubRepositoryReference } from './GitHubRepositoryReference';


export interface PullRequestSearchRequest {
    readonly repository: GitHubRepositoryReference;
    readonly baseBranch: string;
    readonly headBranch: string;
}
