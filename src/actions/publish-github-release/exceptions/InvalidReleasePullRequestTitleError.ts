export class InvalidReleasePullRequestTitleError extends Error {
    public constructor(pullRequestTitle: string) {
        super(`Pull request title '${pullRequestTitle}' does not identify a stable release.`);

        this.name = 'InvalidReleasePullRequestTitleError';
    }
}
