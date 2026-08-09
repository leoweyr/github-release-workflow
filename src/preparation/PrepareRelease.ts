import { dirname, resolve } from 'node:path';

import type { FileSystem } from '../file-system/FileSystem';
import type { GitCliffClient } from '../git-cliff/GitCliffClient';
import { ChangelogStrip } from '../git-cliff/enums/ChangelogStrip';
import type { GitRepository } from '../git/GitRepository';
import type { GitHubClient } from '../github/GitHubClient';
import type { PullRequestReference } from '../github/PullRequestReference';
import { ReleaseContext } from '../release/ReleaseContext';
import { ReleaseTag } from '../release/ReleaseTag';
import type { PrepareReleaseRequest } from './PrepareReleaseRequest';
import type { PrepareReleaseResult } from './PrepareReleaseResult';
import { ReleasePreparationPolicy } from './ReleasePreparationPolicy';
import { MissingChangelogVersionHeadingError } from './exceptions/MissingChangelogVersionHeadingError';
import { ReleaseTagOutsideBranchHistoryError } from './exceptions/ReleaseTagOutsideBranchHistoryError';


export class PrepareRelease {
    private static readonly _firstVersionHeadingPattern: RegExp = /^# \[|^# [0-9]/mu;
    private static readonly _remoteName: string = 'origin';

    private static _removeSectionHeading(changelogSection: string): string {
        const firstLineEndingIndex: number = changelogSection.indexOf('\n');

        if (firstLineEndingIndex === -1) {
            return '';
        }

        return changelogSection.slice(firstLineEndingIndex + 1);
    }

    private static _prependChangelogSection(
        changelogPath: string,
        existingContent: string,
        changelogSection: string,
    ): string {
        const versionHeadingMatch: RegExpExecArray | null = PrepareRelease._firstVersionHeadingPattern.exec(
            existingContent,
        );

        if (versionHeadingMatch === null) {
            throw new MissingChangelogVersionHeadingError(changelogPath);
        }

        return `${existingContent.slice(0, versionHeadingMatch.index)}${changelogSection}${existingContent.slice(
            versionHeadingMatch.index,
        )}`;
    }

    private readonly _fileSystem: FileSystem;
    private readonly _gitCliffClient: GitCliffClient;
    private readonly _gitHubClient: GitHubClient;
    private readonly _gitRepository: GitRepository;
    private readonly _workingDirectory: string;

    public constructor(
        fileSystem: FileSystem,
        gitCliffClient: GitCliffClient,
        gitHubClient: GitHubClient,
        gitRepository: GitRepository,
        workingDirectory: string,
    ) {
        this._fileSystem = fileSystem;
        this._gitCliffClient = gitCliffClient;
        this._gitHubClient = gitHubClient;
        this._gitRepository = gitRepository;
        this._workingDirectory = workingDirectory;
    }

    private async _createPreparationBranch(
        releaseContext: ReleaseContext,
        preparationPolicy: ReleasePreparationPolicy,
    ): Promise<void> {
        const tagRevision: string = `refs/tags/${releaseContext.tagName}`;
        const persistentBranchExists: boolean = await this._gitRepository.remoteBranchExists(
            PrepareRelease._remoteName,
            preparationPolicy.persistentReleaseBranch,
        );

        if (persistentBranchExists) {
            await this._gitRepository.fetchRemoteBranch(
                PrepareRelease._remoteName,
                preparationPolicy.persistentReleaseBranch,
            );

            const persistentBranchRevision: string = `${PrepareRelease._remoteName}/${preparationPolicy.persistentReleaseBranch}`;
            const tagDescendsFromPersistentBranch: boolean = await this._gitRepository.isAncestor(
                persistentBranchRevision,
                tagRevision,
            );

            if (!tagDescendsFromPersistentBranch) {
                throw new ReleaseTagOutsideBranchHistoryError(
                    releaseContext.tagName,
                    preparationPolicy.persistentReleaseBranch,
                );
            }
        } else if (preparationPolicy.isPrerelease) {
            const tagCommitHash: string = await this._gitRepository.resolveCommit(tagRevision);

            await this._gitRepository.pushRevisionAsBranch(
                PrepareRelease._remoteName,
                tagCommitHash,
                preparationPolicy.persistentReleaseBranch,
            );
        }

        await this._gitRepository.createBranch(preparationPolicy.workingBranch, tagRevision);
    }

    private async _generateLatestChangelogSection(
        request: PrepareReleaseRequest,
        releaseContext: ReleaseContext,
        preparationPolicy: ReleasePreparationPolicy,
    ): Promise<string> {
        return this._gitCliffClient.generate({
            workingDirectory: this._workingDirectory,
            configurationPath: request.changelogConfigurationPath,
            tagPattern: releaseContext.tagPattern,
            ...(releaseContext.includePath === null ? {} : { includePath: releaseContext.includePath }),
            ...(preparationPolicy.ignoredTagPattern === null
                ? {}
                : { ignoredTagPattern: preparationPolicy.ignoredTagPattern }),
            latest: true,
            verbose: true,
            strip: ChangelogStrip.ALL,
            environment: request.gitCliffEnvironment,
        });
    }

    private async _updateChangelog(
        request: PrepareReleaseRequest,
        releaseContext: ReleaseContext,
        preparationPolicy: ReleasePreparationPolicy,
        changelogSection: string,
    ): Promise<void> {
        const changelogFilePath: string = resolve(this._workingDirectory, releaseContext.changelogPath);

        if (await this._fileSystem.exists(changelogFilePath)) {
            const existingContent: string = await this._fileSystem.readTextFile(changelogFilePath);
            const mergedContent: string = PrepareRelease._prependChangelogSection(
                releaseContext.changelogPath,
                existingContent,
                changelogSection,
            );

            await this._fileSystem.writeTextFile(changelogFilePath, mergedContent);

            return;
        }

        const tagCommitHash: string = await this._gitRepository.resolveCommit(
            `refs/tags/${releaseContext.tagName}`,
        );

        const changelogContent: string = await this._gitCliffClient.generate({
            workingDirectory: this._workingDirectory,
            configurationPath: request.changelogConfigurationPath,
            tagPattern: releaseContext.tagPattern,
            ...(releaseContext.includePath === null ? {} : { includePath: releaseContext.includePath }),
            ...(preparationPolicy.ignoredTagPattern === null
                ? {}
                : { ignoredTagPattern: preparationPolicy.ignoredTagPattern }),
            revision: tagCommitHash,
            latest: false,
            verbose: true,
            environment: request.gitCliffEnvironment,
        });

        await this._fileSystem.createDirectory(dirname(changelogFilePath));
        await this._fileSystem.writeTextFile(changelogFilePath, changelogContent);
    }

    public async execute(request: PrepareReleaseRequest): Promise<PrepareReleaseResult> {
        const releaseTag: ReleaseTag = ReleaseTag.fromTagName(request.tagName);
        const releaseContext: ReleaseContext = ReleaseContext.resolve(releaseTag, request.packageWorkspaces);
        const preparationPolicy: ReleasePreparationPolicy = new ReleasePreparationPolicy(releaseTag);

        await this._gitRepository.configureAuthor(request.author);
        await this._createPreparationBranch(releaseContext, preparationPolicy);

        const pullRequestBaseBranch: string = preparationPolicy.resolvePullRequestBaseBranch(request.baseBranch);

        const changelogSection: string = await this._generateLatestChangelogSection(
            request,
            releaseContext,
            preparationPolicy,
        );

        await this._updateChangelog(request, releaseContext, preparationPolicy, changelogSection);
        await this._gitRepository.stagePaths([releaseContext.changelogPath]);
        await this._gitRepository.commit(preparationPolicy.pullRequestTitle);
        await this._gitRepository.pushBranch(PrepareRelease._remoteName, preparationPolicy.workingBranch);

        const pullRequest: PullRequestReference = await this._gitHubClient.createPullRequest({
            repository: request.repository,
            title: preparationPolicy.pullRequestTitle,
            body: PrepareRelease._removeSectionHeading(changelogSection),
            baseBranch: pullRequestBaseBranch,
            headBranch: preparationPolicy.workingBranch,
        });

        return {
            tagName: releaseContext.tagName,
            releaseVersion: releaseContext.releaseVersion,
            releaseLabel: releaseContext.releaseLabel,
            changelogPath: releaseContext.changelogPath,
            releaseBranch: preparationPolicy.workingBranch,
            pullRequestBaseBranch,
            pullRequest,
        };
    }
}
