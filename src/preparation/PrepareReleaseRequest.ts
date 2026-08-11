import type { GitAuthor } from '../git/GitAuthor';
import type { GitHubRepositoryReference } from '../github/GitHubRepositoryReference';
import type { PackageWorkspaceCatalog } from '../release/PackageWorkspaceCatalog';


export interface PrepareReleaseRequest {
    readonly tagName: string;
    readonly repository: GitHubRepositoryReference;
    readonly author: GitAuthor;
    readonly packageWorkspaces: PackageWorkspaceCatalog;
    readonly changelogConfigurationPath: string;
    readonly gitCliffEnvironment: Readonly<Record<string, string>>;
}
