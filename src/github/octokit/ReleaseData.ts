export interface ReleaseData {
    readonly id: number;
    readonly html_url: string;
    readonly tag_name: string;
    readonly name: string | null;
    readonly body?: string | null;
    readonly draft: boolean;
    readonly prerelease: boolean;
}
