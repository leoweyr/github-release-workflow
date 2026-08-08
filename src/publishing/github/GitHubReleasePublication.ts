import type { GitHubReleaseReference } from '../../github/GitHubReleaseReference';


export interface GitHubReleasePublication {
    readonly releaseAt: string;
    readonly reference: GitHubReleaseReference;
}
