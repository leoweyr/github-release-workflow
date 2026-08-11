export class InvalidReleasePullRequestRouteError extends Error {
    public constructor(reason: string) {
        super(`Release pull request route is invalid: ${reason}.`);

        this.name = 'InvalidReleasePullRequestRouteError';
    }
}
