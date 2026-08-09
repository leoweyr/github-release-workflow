export class ReleaseTagOutsideBranchHistoryError extends Error {
    public constructor(tagName: string, branchName: string) {
        super(`Release tag '${tagName}' is not descended from release branch '${branchName}'.`);

        this.name = 'ReleaseTagOutsideBranchHistoryError';
    }
}
