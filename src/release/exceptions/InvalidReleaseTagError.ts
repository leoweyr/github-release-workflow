export class InvalidReleaseTagError extends Error {
    public constructor(value: string, source: 'release label' | 'tag name') {
        super(`Release ${source} '${value}' does not match a supported release format.`);

        this.name = 'InvalidReleaseTagError';
    }
}
