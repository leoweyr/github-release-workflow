export class InvalidSemanticVersionError extends Error {
    public constructor(version: string) {
        super(`The version '${version}' is not a valid semantic version.`);

        this.name = 'InvalidSemanticVersionError';
    }
}
