import { PackageName } from './PackageName';
import { SemanticVersion } from './SemanticVersion';
import { InvalidReleaseTagError } from './exceptions/InvalidReleaseTagError';


export class ReleaseTag {
    private static readonly _monorepoTagDelimiter: string = '/v';
    private static readonly _monorepoLabelDelimiter: string = '@v';

    private static _parseReleaseValue(
        value: string,
        monorepoDelimiter: string,
        source: 'release label' | 'tag name',
    ): ReleaseTag {
        const delimiterIndex: number = value.lastIndexOf(monorepoDelimiter);

        if (delimiterIndex > 0) {
            const packageName: PackageName = PackageName.parse(value.slice(0, delimiterIndex));

            const version: SemanticVersion = SemanticVersion.parse(
                value.slice(delimiterIndex + monorepoDelimiter.length),
            );

            return new ReleaseTag(version, packageName);
        }

        if (value.startsWith('v')) {
            return new ReleaseTag(SemanticVersion.parse(value.slice(1)), null);
        }

        throw new InvalidReleaseTagError(value, source);
    }

    public static fromTagName(tagName: string): ReleaseTag {
        return ReleaseTag._parseReleaseValue(tagName, ReleaseTag._monorepoTagDelimiter, 'tag name');
    }

    public static fromReleaseLabel(releaseLabel: string): ReleaseTag {
        return ReleaseTag._parseReleaseValue(releaseLabel, ReleaseTag._monorepoLabelDelimiter, 'release label');
    }

    private readonly _packageName: PackageName | null;
    private readonly _version: SemanticVersion;

    private constructor(version: SemanticVersion, packageName: PackageName | null) {
        this._version = version;
        this._packageName = packageName;
    }

    public get version(): SemanticVersion {
        return this._version;
    }

    public get packageName(): PackageName | null {
        return this._packageName;
    }

    public get tagName(): string {
        if (this._packageName === null) {
            return this._version.versionTag;
        }

        return `${this._packageName.value}/${this._version.versionTag}`;
    }

    public get releaseLabel(): string {
        if (this._packageName === null) {
            return this._version.versionTag;
        }

        return `${this._packageName.value}@${this._version.versionTag}`;
    }

    public get releaseTitle(): string {
        if (this._packageName === null) {
            return this._version.value;
        }

        return this.releaseLabel;
    }

    public get tagPattern(): string {
        if (this._packageName === null) {
            return '^v[0-9].*';
        }

        return `^${this._packageName.regularExpressionValue}/v[0-9].*`;
    }

    public get isMonorepoRelease(): boolean {
        return this._packageName !== null;
    }

    public equals(otherReleaseTag: ReleaseTag): boolean {
        const packageNamesMatch: boolean =
            this._packageName === null
                ? otherReleaseTag.packageName === null
                : otherReleaseTag.packageName !== null && this._packageName.equals(otherReleaseTag.packageName);

        return packageNamesMatch && this._version.equals(otherReleaseTag.version);
    }
}
