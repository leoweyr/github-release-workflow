export class InvalidPackageWorkspaceError extends Error {
    public constructor(packageName: string, workspace: string) {
        super(`Workspace '${workspace}' for package '${packageName}' is invalid.`);

        this.name = 'InvalidPackageWorkspaceError';
    }
}
