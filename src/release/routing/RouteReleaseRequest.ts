import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';


export interface RouteReleaseRequest {
    readonly repository: GitHubRepositoryReference;
    readonly pullRequestTitle: string;
    readonly pullRequestBody: string;
    readonly baseBranch: string;
    readonly headBranch: string;
    readonly headRevision: string;
    readonly mainBranch: string;
}
