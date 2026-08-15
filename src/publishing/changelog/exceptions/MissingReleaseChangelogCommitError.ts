export class MissingReleaseChangelogCommitError extends Error {
    public constructor(releaseBranch: string, releaseCommitSubject: string) {
        super(`Release branch '${releaseBranch}' has no commit with subject '${releaseCommitSubject}'.`);

        this.name = 'MissingReleaseChangelogCommitError';
    }
}
