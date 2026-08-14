import type { GitHubRepositoryReference } from './GitHubRepositoryReference';
import type { GitHubReleaseLatestPolicy } from './enums/GitHubReleaseLatestPolicy';


export interface GitHubReleaseCreationRequest {
    readonly repository: GitHubRepositoryReference;
    readonly tagName: string;
    readonly title: string;
    readonly body: string;
    readonly draft: boolean;
    readonly prerelease: boolean;
    readonly makeLatest?: GitHubReleaseLatestPolicy;
}
