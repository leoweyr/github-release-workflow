export class InvalidPackageNameError extends Error {
    public constructor(packageName: string) {
        super(`Package name '${packageName}' is invalid.`);

        this.name = 'InvalidPackageNameError';
    }
}
