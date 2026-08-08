export class InvalidNpmPackagePublishingOperationError extends Error {
    public constructor(operation: string | undefined) {
        super(`NPM package publishing operation '${operation ?? ''}' is not supported.`);

        this.name = 'InvalidNpmPackagePublishingOperationError';
    }
}
