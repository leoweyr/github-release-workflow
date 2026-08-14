import type { GitRepository } from '../../git/GitRepository';
import { ReleaseTag } from '../ReleaseTag';
import type { ReleaseMetadata } from './ReleaseMetadata';
import { InvalidReleasePullRequestTitleError } from './exceptions/InvalidReleasePullRequestTitleError';
import { ReleaseTagOutsideMergedBranchError } from './exceptions/ReleaseTagOutsideMergedBranchError';


export class ReleaseMetadataResolver {
    private static readonly _releaseTitlePrefix: string = 'release: ';

    private static _parseReleaseTag(pullRequestTitle: string): ReleaseTag {
        if (!pullRequestTitle.startsWith(ReleaseMetadataResolver._releaseTitlePrefix)) {
            throw new InvalidReleasePullRequestTitleError(pullRequestTitle);
        }

        const releaseLabel: string = pullRequestTitle.slice(
            ReleaseMetadataResolver._releaseTitlePrefix.length,
        );

        return ReleaseTag.fromReleaseLabel(releaseLabel);
    }

    private readonly _gitRepository: GitRepository;

    public constructor(gitRepository: GitRepository) {
        this._gitRepository = gitRepository;
    }

    public async resolve(pullRequestTitle: string): Promise<ReleaseMetadata> {
        const releaseTag: ReleaseTag = ReleaseMetadataResolver._parseReleaseTag(pullRequestTitle);
        const tagCommitHash: string = await this._gitRepository.resolveCommit(`refs/tags/${releaseTag.tagName}`);
        const tagBelongsToReleaseHistory: boolean = await this._gitRepository.isAncestor(tagCommitHash, 'HEAD');

        if (!tagBelongsToReleaseHistory) {
            throw new ReleaseTagOutsideMergedBranchError(releaseTag.tagName);
        }

        const releaseDate: Date = await this._gitRepository.getCommitDate(tagCommitHash);

        return {
            tagName: releaseTag.tagName,
            releaseVersion: releaseTag.version.value,
            releaseAt: releaseDate.toISOString(),
            packageName: releaseTag.packageName?.value ?? '',
            prerelease: releaseTag.version.isPrerelease,
        };
    }
}
