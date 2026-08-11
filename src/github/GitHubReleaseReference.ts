export interface GitHubReleaseReference {
    readonly identifier: number;
    readonly url: string;
    readonly tagName: string;
    readonly title: string | null;
    readonly body: string | null;
    readonly draft: boolean;
    readonly prerelease: boolean;
}
