import type { GitHubReleaseReference } from '../../github/GitHubReleaseReference';


export interface GitHubReleasePublication {
    readonly created: boolean;
    readonly reference: GitHubReleaseReference;
}
