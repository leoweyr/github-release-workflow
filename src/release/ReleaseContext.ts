import { PackageWorkspaceCatalog } from './PackageWorkspaceCatalog';
import { ReleaseTag } from './ReleaseTag';


export class ReleaseContext {
    public static resolve(releaseTag: ReleaseTag, packageWorkspaces: PackageWorkspaceCatalog): ReleaseContext {
        if (releaseTag.packageName === null) {
            return new ReleaseContext(releaseTag, null);
        }

        const workspace: string = packageWorkspaces.resolve(releaseTag.packageName);

        return new ReleaseContext(releaseTag, workspace);
    }

    private readonly _releaseTag: ReleaseTag;
    private readonly _workspace: string | null;

    private constructor(releaseTag: ReleaseTag, workspace: string | null) {
        this._releaseTag = releaseTag;
        this._workspace = workspace;
    }

    public get tagName(): string {
        return this._releaseTag.tagName;
    }

    public get releaseVersion(): string {
        return this._releaseTag.version.value;
    }

    public get releaseLabel(): string {
        return this._releaseTag.releaseLabel;
    }

    public get releaseTitle(): string {
        return this._releaseTag.releaseTitle;
    }

    public get packageName(): string | null {
        return this._releaseTag.packageName?.value ?? null;
    }

    public get workspace(): string | null {
        return this._workspace;
    }

    public get changelogPath(): string {
        if (this._workspace === null) {
            return 'CHANGELOG.md';
        }

        return `${this._workspace}/CHANGELOG.md`;
    }

    public get includePath(): string | null {
        if (this._workspace === null) {
            return null;
        }

        return `${this._workspace}/**`;
    }

    public get tagPattern(): string {
        return this._releaseTag.tagPattern;
    }

    public get releaseBranch(): string {
        return `release/${this._releaseTag.tagName}`;
    }
}
