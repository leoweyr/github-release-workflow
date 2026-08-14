import type { PullRequestReference } from '../github/PullRequestReference';


export interface PrepareReleaseResult {
    readonly tagName: string;
    readonly releaseVersion: string;
    readonly releaseLabel: string;
    readonly changelogPath: string;
    readonly releaseBranch: string;
    readonly pullRequestBaseBranch: string;
    readonly pullRequest: PullRequestReference;
}
