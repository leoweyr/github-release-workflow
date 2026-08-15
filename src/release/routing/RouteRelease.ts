import type { PullRequestReference } from '../../github/PullRequestReference';
import type { ReleasePullRequestCreator } from '../pull-request/ReleasePullRequestCreator';
import { ReleaseTag } from '../ReleaseTag';
import type { RouteReleaseRequest } from './RouteReleaseRequest';
import type { RouteReleaseResult } from './RouteReleaseResult';
import { InvalidReleasePullRequestRouteError } from './exceptions/InvalidReleasePullRequestRouteError';


export class RouteRelease {
    private static readonly _releaseTitlePrefix: string = 'release: ';

    private static _parseReleaseTag(pullRequestTitle: string): ReleaseTag {
        if (!pullRequestTitle.startsWith(RouteRelease._releaseTitlePrefix)) {
            throw new InvalidReleasePullRequestRouteError('the pull request title is not a release title');
        }

        const releaseLabel: string = pullRequestTitle.slice(RouteRelease._releaseTitlePrefix.length);

        return ReleaseTag.fromReleaseLabel(releaseLabel);
    }

    private readonly _releasePullRequestCreator: ReleasePullRequestCreator;

    public constructor(releasePullRequestCreator: ReleasePullRequestCreator) {
        this._releasePullRequestCreator = releasePullRequestCreator;
    }

    public async execute(request: RouteReleaseRequest): Promise<RouteReleaseResult> {
        const releaseTag: ReleaseTag = RouteRelease._parseReleaseTag(request.pullRequestTitle);
        const releaseBranch: string = `release/${releaseTag.targetTagName}`;
        const prereleaseBranch: string = `prerelease/${releaseTag.tagName}`;
        const isReleaseBranchPullRequest: boolean = request.baseBranch === releaseBranch
            && request.headBranch === prereleaseBranch;

        if (isReleaseBranchPullRequest) {
            if (releaseTag.version.isPrerelease) {
                return {
                    publishRelease: true,
                    releaseBranch,
                    releaseHistoryRevision: request.baseBranch,
                    promotionPullRequest: null,
                };
            }

            const promotionPullRequest: PullRequestReference = await this._promoteStableRelease(
                request,
                releaseTag,
                releaseBranch,
                request.mainBranch,
            );

            return {
                publishRelease: false,
                releaseBranch,
                releaseHistoryRevision: null,
                promotionPullRequest,
            };
        }

        const isStablePublicationPullRequest: boolean = !releaseTag.version.isPrerelease
            && request.baseBranch === request.mainBranch
            && request.headBranch === releaseBranch;

        if (isStablePublicationPullRequest) {
            return {
                publishRelease: true,
                releaseBranch,
                releaseHistoryRevision: request.headRevision,
                promotionPullRequest: null,
            };
        }

        throw new InvalidReleasePullRequestRouteError(
            `branches '${request.headBranch}' and '${request.baseBranch}' do not match the release version`,
        );
    }

    private async _promoteStableRelease(
        request: RouteReleaseRequest,
        releaseTag: ReleaseTag,
        releaseBranch: string,
        mainBranch: string,
    ): Promise<PullRequestReference> {
        return this._releasePullRequestCreator.createOrReuse({
            repository: request.repository,
            releaseTag,
            body: request.pullRequestBody,
            baseBranch: mainBranch,
            headBranch: releaseBranch,
        });
    }
}
