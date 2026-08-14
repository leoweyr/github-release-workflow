import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import type { ReleaseTag } from '../ReleaseTag';


export interface ReleasePullRequestCreationRequest {
    readonly repository: GitHubRepositoryReference;
    readonly releaseTag: ReleaseTag;
    readonly body: string;
    readonly baseBranch: string;
    readonly headBranch: string;
}
