export class ReleaseTagOutsideMergedBranchError extends Error {
    public constructor(tagName: string) {
        super(`Release tag '${tagName}' is not part of the merged pull request base branch.`);

        this.name = 'ReleaseTagOutsideMergedBranchError';
    }
}
