export class MissingChangelogVersionHeadingError extends Error {
    public constructor(changelogPath: string) {
        super(`Changelog '${changelogPath}' does not contain a version heading.`);

        this.name = 'MissingChangelogVersionHeadingError';
    }
}
