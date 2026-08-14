import { ReleaseTag } from '../release/ReleaseTag';


export class ReleasePreparationPolicy {
    private readonly _mainBranch: string;
    private readonly _persistentReleaseBranchExists: boolean;
    private readonly _releaseTag: ReleaseTag;

    public constructor(
        releaseTag: ReleaseTag,
        mainBranch: string,
        persistentReleaseBranchExists: boolean,
    ) {
        this._mainBranch = mainBranch;
        this._persistentReleaseBranchExists = persistentReleaseBranchExists;
        this._releaseTag = releaseTag;
    }

    private get _isDirectStableRelease(): boolean {
        return !this._releaseTag.version.isPrerelease && !this._persistentReleaseBranchExists;
    }

    public get persistentReleaseBranch(): string {
        return `release/${this._releaseTag.targetTagName}`;
    }

    public get workingBranch(): string {
        if (this._isDirectStableRelease) {
            return this.persistentReleaseBranch;
        }

        return `prerelease/${this._releaseTag.tagName}`;
    }

    public get pullRequestTitle(): string {
        return `release: ${this._releaseTag.releaseLabel}`;
    }

    public get pullRequestBaseBranch(): string {
        if (this._isDirectStableRelease) {
            return this._mainBranch;
        }

        return this.persistentReleaseBranch;
    }

    public get shouldInitializePersistentReleaseBranch(): boolean {
        return !this._persistentReleaseBranchExists && !this._isDirectStableRelease;
    }
}
