export interface NpmPublishSettings {
    readonly nodeVersion: string;
    readonly packageDirectory: string;
    readonly deployCommand: string;
    readonly distTag: string;
}
