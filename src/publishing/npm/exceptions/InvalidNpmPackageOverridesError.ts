export class InvalidNpmPackageOverridesError extends Error {
    public constructor(reason: string) {
        super(`NPM package overrides are invalid: ${reason}`);

        this.name = 'InvalidNpmPackageOverridesError';
    }
}
