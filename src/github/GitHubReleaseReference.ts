export interface GitHubReleaseReference {
    readonly identifier: number;
    readonly url: string;
    readonly tagName: string;
    readonly draft: boolean;
    readonly prerelease: boolean;
}
