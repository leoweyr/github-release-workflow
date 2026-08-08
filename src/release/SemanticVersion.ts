import { InvalidSemanticVersionError } from './exceptions/InvalidSemanticVersionError';


export class SemanticVersion {
    private static readonly _semanticVersionPattern: RegExp = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-((?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/u;

    private static _readRequiredCapture(versionMatch: RegExpExecArray, index: number, version: string): string {
        const value: string | undefined = versionMatch[index];

        if (value === undefined) {
            throw new InvalidSemanticVersionError(version);
        }

        return value;
    }

    private static _readOptionalIdentifiers(versionMatch: RegExpExecArray, index: number): readonly string[] {
        const value: string | undefined = versionMatch[index];
        const identifiers: string[] = value === undefined ? [] : value.split('.');

        // The value object retains this array and exposes the same reference through its getters.
        return Object.freeze(identifiers);
    }

    public static parse(version: string): SemanticVersion {
        const versionMatch: RegExpExecArray | null = SemanticVersion._semanticVersionPattern.exec(version);

        if (versionMatch === null || versionMatch[0] !== version) {
            throw new InvalidSemanticVersionError(version);
        }

        return new SemanticVersion(version, versionMatch);
    }

    private readonly _value: string;
    private readonly _major: bigint;
    private readonly _minor: bigint;
    private readonly _patch: bigint;
    private readonly _prereleaseIdentifiers: readonly string[];
    private readonly _buildMetadataIdentifiers: readonly string[];

    private constructor(version: string, versionMatch: RegExpExecArray) {
        this._value = version;
        this._major = BigInt(SemanticVersion._readRequiredCapture(versionMatch, 1, version));
        this._minor = BigInt(SemanticVersion._readRequiredCapture(versionMatch, 2, version));
        this._patch = BigInt(SemanticVersion._readRequiredCapture(versionMatch, 3, version));
        this._prereleaseIdentifiers = SemanticVersion._readOptionalIdentifiers(versionMatch, 4);
        this._buildMetadataIdentifiers = SemanticVersion._readOptionalIdentifiers(versionMatch, 5);
    }

    public get value(): string {
        return this._value;
    }

    public get versionTag(): string {
        return `v${this._value}`;
    }

    public get major(): bigint {
        return this._major;
    }

    public get minor(): bigint {
        return this._minor;
    }

    public get patch(): bigint {
        return this._patch;
    }

    public get prereleaseIdentifiers(): readonly string[] {
        return this._prereleaseIdentifiers;
    }

    public get buildMetadataIdentifiers(): readonly string[] {
        return this._buildMetadataIdentifiers;
    }

    public get isPrerelease(): boolean {
        return this._prereleaseIdentifiers.length > 0;
    }

    public equals(otherVersion: SemanticVersion): boolean {
        return this._value === otherVersion.value;
    }
}
