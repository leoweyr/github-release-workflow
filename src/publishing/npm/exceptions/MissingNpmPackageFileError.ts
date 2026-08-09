export class MissingNpmPackageFileError extends Error {
    public constructor(packageFilePath: string) {
        super(`NPM package file '${packageFilePath}' does not exist.`);

        this.name = 'MissingNpmPackageFileError';
    }
}
