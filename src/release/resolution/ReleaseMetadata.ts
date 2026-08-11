export interface ReleaseMetadata {
    readonly tagName: string;
    readonly releaseVersion: string;
    readonly releaseAt: string;
    readonly packageName: string;
    readonly prerelease: boolean;
}
