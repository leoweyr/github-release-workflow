import { ReleaseTag } from '../release/ReleaseTag';


export class ReleasePreparationPolicy {
    private readonly _releaseTag: ReleaseTag;

    public constructor(releaseTag: ReleaseTag) {
        this._releaseTag = releaseTag;
    }

    public get persistentReleaseBranch(): string {
        return `release/${this._releaseTag.targetTagName}`;
    }

    public get workingBranch(): string {
        return `prerelease/${this._releaseTag.tagName}`;
    }

    public get pullRequestTitle(): string {
        return `release: ${this._releaseTag.releaseLabel}`;
    }

    public get pullRequestBaseBranch(): string {
        return this.persistentReleaseBranch;
    }
}
