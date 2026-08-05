export class UndeclaredPackageError extends Error {
    public constructor(packageName: string) {
        super(`Sub-package '${packageName}' is not declared.`);

        this.name = 'UndeclaredPackageError';
    }
}
