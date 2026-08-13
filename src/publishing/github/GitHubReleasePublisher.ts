import type { GitRepository } from '../../git/GitRepository';
import type { GitHubClient } from '../../github/GitHubClient';
import type { GitHubRepositoryReference } from '../../github/GitHubRepositoryReference';
import type { ReleaseTag } from '../../release/ReleaseTag';
import type { GitHubReleasePublication } from './GitHubReleasePublication';
import type { GitHubReleaseReference } from '../../github/GitHubReleaseReference';
import { GitHubReleaseLatestPolicy } from '../../github/enums/GitHubReleaseLatestPolicy';
import { ConflictingGitHubReleaseError } from './exceptions/ConflictingGitHubReleaseError';
import { ReleaseTagOutsidePublishedBranchError } from './exceptions/ReleaseTagOutsidePublishedBranchError';


export class GitHubReleasePublisher {
    private static _releaseMatches(
        releaseReference: GitHubReleaseReference,
        releaseTag: ReleaseTag,
        releaseBody: string,
    ): boolean {
        return releaseReference.tagName === releaseTag.tagName
            && releaseReference.title === releaseTag.releaseTitle
            && (releaseReference.body ?? '') === releaseBody
            && !releaseReference.draft
            && releaseReference.prerelease === releaseTag.version.isPrerelease;
    }

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
        const tagBelongsToReleaseHistory: boolean = await this._gitRepository.isAncestor(tagCommitHash, 'HEAD');

        if (!tagBelongsToReleaseHistory) {
            throw new ReleaseTagOutsidePublishedBranchError(releaseTag.tagName);
        }

        const existingRelease: GitHubReleaseReference | null = await this._gitHubClient.getReleaseByTag(
            repository,
            releaseTag.tagName,
        );

        if (existingRelease !== null) {
            if (!GitHubReleasePublisher._releaseMatches(existingRelease, releaseTag, releaseBody)) {
                throw new ConflictingGitHubReleaseError(releaseTag.tagName);
            }

            return {
                created: false,
                reference: existingRelease,
            };
        }

        const releaseReference: GitHubReleaseReference = await this._gitHubClient.createRelease({
            repository,
            tagName: releaseTag.tagName,
            title: releaseTag.releaseTitle,
            body: releaseBody,
            draft: false,
            prerelease: releaseTag.version.isPrerelease,
            makeLatest: releaseTag.version.isPrerelease
                ? GitHubReleaseLatestPolicy.NOT_LATEST
                : GitHubReleaseLatestPolicy.AUTOMATIC,
        });

        return {
            created: true,
            reference: releaseReference,
        };
    }
}
