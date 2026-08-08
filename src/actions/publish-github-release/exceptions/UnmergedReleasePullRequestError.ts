export class UnmergedReleasePullRequestError extends Error {
    public constructor() {
        super('The release pull request must be merged before publishing.');

        this.name = 'UnmergedReleasePullRequestError';
    }
}
