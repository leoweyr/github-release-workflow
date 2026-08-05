export interface ReleaseData {
    readonly id: number;
    readonly html_url: string;
    readonly tag_name: string;
    readonly draft: boolean;
    readonly prerelease: boolean;
}
