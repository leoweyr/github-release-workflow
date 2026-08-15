import type { GitAuthor } from '../../git/GitAuthor';


export interface ReleaseChangelogSynchronizationRequest {
    readonly author: GitAuthor;
    readonly developmentBranch: string;
    readonly releaseBranch: string;
    readonly releaseCommitSubject: string;
    readonly releaseRevision: string;
}
