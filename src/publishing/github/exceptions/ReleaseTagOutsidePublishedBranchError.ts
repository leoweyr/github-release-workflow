export class ReleaseTagOutsidePublishedBranchError extends Error {
    public constructor(tagName: string) {
        super(`Release tag '${tagName}' is not part of the validated release history.`);

        this.name = 'ReleaseTagOutsidePublishedBranchError';
    }
}
