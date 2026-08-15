import type { PullRequestReference } from '../../github/PullRequestReference';


export interface RouteReleaseResult {
    readonly publishRelease: boolean;
    readonly releaseBranch: string;
    readonly releaseHistoryRevision: string | null;
    readonly promotionPullRequest: PullRequestReference | null;
}
