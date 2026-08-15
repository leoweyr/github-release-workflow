export class AmbiguousReleaseChangelogCommitError extends Error {
    public constructor(releaseBranch: string, releaseCommitSubject: string) {
        super(
            `Release branch '${releaseBranch}' contains multiple commits with subject '${releaseCommitSubject}'.`,
        );

        this.name = 'AmbiguousReleaseChangelogCommitError';
    }
}
