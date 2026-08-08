export class InvalidNpmPublishConfigurationError extends Error {
    public constructor(propertyName: string) {
        super(`NPM publish configuration property '${propertyName}' must not be empty.`);

        this.name = 'InvalidNpmPublishConfigurationError';
    }
}
