export const GitHubReleaseLatestPolicy = {
    AUTOMATIC: 'legacy',
    LATEST: 'true',
    NOT_LATEST: 'false',
} as const;


export type GitHubReleaseLatestPolicy =
    (typeof GitHubReleaseLatestPolicy)[keyof typeof GitHubReleaseLatestPolicy];
