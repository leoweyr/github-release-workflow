import type { GitHubClient } from '../../github/GitHubClient';
import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';


export class TrbProjectNodeVersionBumper {
    private static readonly _workflowFileName: string = 'bump-node-version.yml';

    private readonly _gitHubClient: GitHubClient;

    public constructor(gitHubClient: GitHubClient) {
        this._gitHubClient = gitHubClient;
    }

    public async bump(
        repository: GitHubRepositoryReference,
        projectNodeName: string,
        releaseVersion: string,
        releaseAt: string,
    ): Promise<void> {
        const defaultBranch: string = await this._gitHubClient.getDefaultBranch(repository);

        await this._gitHubClient.dispatchWorkflow({
            repository,
            workflowIdentifier: TrbProjectNodeVersionBumper._workflowFileName,
            reference: defaultBranch,
            inputs: {
                'node-description': projectNodeName,
                'release-version': releaseVersion,
                'release-at': releaseAt,
            },
        });
    }
}
