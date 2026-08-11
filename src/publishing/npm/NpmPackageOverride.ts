export interface NpmPackageOverride {
    readonly nodeVersion?: string;
    readonly packageDirectory?: string;
    readonly deployCommand?: string;
    readonly distTag?: string;
}
