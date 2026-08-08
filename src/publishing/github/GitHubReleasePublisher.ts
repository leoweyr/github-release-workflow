import type { GitRepository } from '../../git/GitRepository';
import type { GitHubClient } from '../../github/GitHubClient';
import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import type { ReleaseTag } from '../../release/ReleaseTag';
import type { GitHubReleasePublication } from './GitHubReleasePublication';
import type { GitHubReleaseReference } from '../../github/GitHubReleaseReference';
import { GitHubReleaseLatestPolicy } from '../../github/enums/GitHubReleaseLatestPolicy';


export class GitHubReleasePublisher {
    private readonly _gitRepository: GitRepository;
    private readonly _gitHubClient: GitHubClient;

    public constructor(gitRepository: GitRepository, gitHubClient: GitHubClient) {
        this._gitRepository = gitRepository;
        this._gitHubClient = gitHubClient;
    }

    public async publish(
        repository: GitHubRepositoryReference,
        releaseTag: ReleaseTag,
        releaseBody: string,
    ): Promise<GitHubReleasePublication> {
        const tagCommitHash: string = await this._gitRepository.resolveCommit(`refs/tags/${releaseTag.tagName}`);
        const releaseDate: Date = await this._gitRepository.getCommitDate(tagCommitHash);

        const releaseReference: GitHubReleaseReference = await this._gitHubClient.createRelease({
            repository,
            tagName: releaseTag.tagName,
            title: releaseTag.releaseTitle,
            body: releaseBody,
            draft: false,
            prerelease: false,
            makeLatest: GitHubReleaseLatestPolicy.AUTOMATIC,
        });

        return {
            releaseAt: releaseDate.toISOString(),
            reference: releaseReference,
        };
    }
}
