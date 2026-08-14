export class InvalidPackageWorkspacesError extends Error {
    public constructor(reason: string) {
        super(`Package workspace configuration is invalid: ${reason}.`);

        this.name = 'InvalidPackageWorkspacesError';
    }
}
