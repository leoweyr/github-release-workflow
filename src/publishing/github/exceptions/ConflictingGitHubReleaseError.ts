export class ConflictingGitHubReleaseError extends Error {
    public constructor(tagName: string) {
        super(`GitHub Release '${tagName}' already exists with conflicting attributes.`);

        this.name = 'ConflictingGitHubReleaseError';
    }
}
