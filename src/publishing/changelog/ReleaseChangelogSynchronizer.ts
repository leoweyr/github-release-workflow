import type { GitRepository } from '../../git/GitRepository';
import type { ReleaseChangelogSynchronizationRequest } from './ReleaseChangelogSynchronizationRequest';
import type { ReleaseChangelogSynchronizationResult } from './ReleaseChangelogSynchronizationResult';
import { AmbiguousReleaseChangelogCommitError } from './exceptions/AmbiguousReleaseChangelogCommitError';
import { MissingReleaseChangelogCommitError } from './exceptions/MissingReleaseChangelogCommitError';


export class ReleaseChangelogSynchronizer {
    private static readonly _remoteName: string = 'origin';

    private readonly _gitRepository: GitRepository;

    public constructor(gitRepository: GitRepository) {
        this._gitRepository = gitRepository;
    }

    public async synchronize(
        request: ReleaseChangelogSynchronizationRequest,
    ): Promise<ReleaseChangelogSynchronizationResult> {
        await this._gitRepository.fetchRemoteRevision(
            ReleaseChangelogSynchronizer._remoteName,
            request.releaseRevision,
        );

        const changelogCommitHashes: readonly string[] = await this._gitRepository.findCommitsBySubject(
            'FETCH_HEAD',
            request.releaseCommitSubject,
        );

        const changelogCommitHash: string | undefined = changelogCommitHashes[0];

        if (changelogCommitHash === undefined) {
            throw new MissingReleaseChangelogCommitError(
                request.releaseBranch,
                request.releaseCommitSubject,
            );
        }

        if (changelogCommitHashes.length > 1) {
            throw new AmbiguousReleaseChangelogCommitError(
                request.releaseBranch,
                request.releaseCommitSubject,
            );
        }

        const patchAlreadyApplied: boolean = await this._gitRepository.hasEquivalentPatch(
            changelogCommitHash,
            'HEAD',
        );

        if (patchAlreadyApplied) {
            return {
                commitHash: changelogCommitHash,
                synchronized: false,
            };
        }

        await this._gitRepository.configureAuthor(request.author);
        await this._gitRepository.cherryPick(changelogCommitHash);

        await this._gitRepository.pushBranch(
            ReleaseChangelogSynchronizer._remoteName,
            request.developmentBranch,
        );

        return {
            commitHash: changelogCommitHash,
            synchronized: true,
        };
    }
}
