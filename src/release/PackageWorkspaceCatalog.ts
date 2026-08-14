import { PackageName } from './PackageName';
import { InvalidPackageWorkspaceError } from './exceptions/InvalidPackageWorkspaceError';
import { UndeclaredPackageError } from './exceptions/UndeclaredPackageError';


export type PackageWorkspaceRecord = Readonly<Record<string, string>>;


export class PackageWorkspaceCatalog {
    private static _normalizeWorkspace(packageName: PackageName, workspace: string): string {
        const normalizedWorkspace: string = workspace.replace(/\/+$/u, '');
        const workspaceSegments: string[] = normalizedWorkspace.split('/');
        const hasInvalidBoundary: boolean = workspace !== workspace.trim() || normalizedWorkspace.startsWith('/');
        const escapesRepository: boolean = workspaceSegments.includes('..');

        if (normalizedWorkspace.length === 0 || hasInvalidBoundary || escapesRepository) {
            throw new InvalidPackageWorkspaceError(packageName.value, workspace);
        }

        return normalizedWorkspace;
    }

    private readonly _workspaces: ReadonlyMap<string, string>;

    public constructor(packageWorkspaces: PackageWorkspaceRecord) {
        const normalizedWorkspaces: Map<string, string> = new Map<string, string>();
        const packageWorkspaceEntries: [string, string][] = Object.entries(packageWorkspaces);

        packageWorkspaceEntries.forEach((packageWorkspaceEntry: [string, string]): void => {
            const packageNameValue: string = packageWorkspaceEntry[0];
            const workspaceValue: string = packageWorkspaceEntry[1];
            const packageName: PackageName = PackageName.parse(packageNameValue);
            const workspace: string = PackageWorkspaceCatalog._normalizeWorkspace(packageName, workspaceValue);

            normalizedWorkspaces.set(packageName.value, workspace);
        });

        this._workspaces = normalizedWorkspaces;
    }

    public resolve(packageName: PackageName): string {
        const workspace: string | undefined = this._workspaces.get(packageName.value);

        if (workspace === undefined) {
            throw new UndeclaredPackageError(packageName.value);
        }

        return workspace;
    }

    public has(packageName: PackageName): boolean {
        return this._workspaces.has(packageName.value);
    }
}
