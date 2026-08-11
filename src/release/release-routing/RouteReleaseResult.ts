import type { PullRequestReference } from '../../github/PullRequestReference';


export interface RouteReleaseResult {
    readonly publishRelease: boolean;
    readonly promotionPullRequest: PullRequestReference | null;
}
