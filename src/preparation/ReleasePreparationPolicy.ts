import { ReleaseTag } from '../release/ReleaseTag';


export class ReleasePreparationPolicy {
    private readonly _releaseTag: ReleaseTag;

    public constructor(releaseTag: ReleaseTag) {
        this._releaseTag = releaseTag;
    }

    public get isPrerelease(): boolean {
        return this._releaseTag.version.isPrerelease;
    }

    public get persistentReleaseBranch(): string {
        return `release/${this._releaseTag.targetTagName}`;
    }

    public get workingBranch(): string {
        if (this.isPrerelease) {
            return `automation/prerelease/${this._releaseTag.tagName}`;
        }

        return this.persistentReleaseBranch;
    }

    public get pullRequestTitle(): string {
        const titlePrefix: string = this.isPrerelease ? 'prerelease' : 'release';

        return `${titlePrefix}: ${this._releaseTag.releaseLabel}`;
    }

    public get ignoredTagPattern(): string | null {
        if (this.isPrerelease) {
            return null;
        }

        return this._releaseTag.prereleaseTagPattern;
    }

    public resolvePullRequestBaseBranch(stableBaseBranch: string): string {
        if (this.isPrerelease) {
            return this.persistentReleaseBranch;
        }

        return stableBaseBranch;
    }
}
