import { dirname, resolve } from 'node:path';

import type { FileSystem } from '../file-system/FileSystem';
import type { GitCliffClient } from '../git-cliff/GitCliffClient';
import { ChangelogStrip } from '../git-cliff/enums/ChangelogStrip';
import type { GitRepository } from '../git/GitRepository';
import type { PullRequestReference } from '../github/PullRequestReference';
import { ReleaseContext } from '../release/ReleaseContext';
import type { ReleasePullRequestCreator } from '../release/pull-request/ReleasePullRequestCreator';
import { ReleaseTag } from '../release/ReleaseTag';
import type { PrepareReleaseRequest } from './PrepareReleaseRequest';
import type { PrepareReleaseResult } from './PrepareReleaseResult';
import { ReleasePreparationPolicy } from './ReleasePreparationPolicy';
import { MissingChangelogVersionHeadingError } from './exceptions/MissingChangelogVersionHeadingError';


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
    private readonly _gitRepository: GitRepository;
    private readonly _releasePullRequestCreator: ReleasePullRequestCreator;
    private readonly _workingDirectory: string;

    public constructor(
        fileSystem: FileSystem,
        gitCliffClient: GitCliffClient,
        gitRepository: GitRepository,
        releasePullRequestCreator: ReleasePullRequestCreator,
        workingDirectory: string,
    ) {
        this._fileSystem = fileSystem;
        this._gitCliffClient = gitCliffClient;
        this._gitRepository = gitRepository;
        this._releasePullRequestCreator = releasePullRequestCreator;
        this._workingDirectory = workingDirectory;
    }

    private async _createPreparationBranch(
        releaseContext: ReleaseContext,
        preparationPolicy: ReleasePreparationPolicy,
    ): Promise<void> {
        const tagRevision: string = `refs/tags/${releaseContext.tagName}`;

        if (preparationPolicy.shouldInitializePersistentReleaseBranch) {
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
    ): Promise<string> {
        return this._gitCliffClient.generate({
            workingDirectory: this._workingDirectory,
            configurationPath: request.changelogConfigurationPath,
            tagPattern: releaseContext.tagPattern,
            ...(releaseContext.includePath === null ? {} : { includePath: releaseContext.includePath }),
            latest: true,
            verbose: true,
            strip: ChangelogStrip.ALL,
            environment: request.gitCliffEnvironment,
        });
    }

    private async _updateChangelog(
        request: PrepareReleaseRequest,
        releaseContext: ReleaseContext,
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

        const changelogContent: string = await this._gitCliffClient.generate({
            workingDirectory: this._workingDirectory,
            configurationPath: request.changelogConfigurationPath,
            tagPattern: releaseContext.tagPattern,
            ...(releaseContext.includePath === null ? {} : { includePath: releaseContext.includePath }),
            latest: true,
            verbose: true,
            environment: request.gitCliffEnvironment,
        });

        await this._fileSystem.createDirectory(dirname(changelogFilePath));
        await this._fileSystem.writeTextFile(changelogFilePath, changelogContent);
    }

    public async execute(request: PrepareReleaseRequest): Promise<PrepareReleaseResult> {
        const releaseTag: ReleaseTag = ReleaseTag.fromTagName(request.tagName);
        const releaseContext: ReleaseContext = ReleaseContext.resolve(releaseTag, request.packageWorkspaces);
        const persistentReleaseBranch: string = `release/${releaseTag.targetTagName}`;

        const persistentReleaseBranchExists: boolean = await this._gitRepository.remoteBranchExists(
            PrepareRelease._remoteName,
            persistentReleaseBranch,
        );

        const preparationPolicy: ReleasePreparationPolicy = new ReleasePreparationPolicy(
            releaseTag,
            request.mainBranch,
            persistentReleaseBranchExists,
        );

        await this._gitRepository.configureAuthor(request.author);
        await this._createPreparationBranch(releaseContext, preparationPolicy);

        const changelogSection: string = await this._generateLatestChangelogSection(
            request,
            releaseContext,
        );

        const pullRequestBaseBranch: string = preparationPolicy.pullRequestBaseBranch;

        await this._updateChangelog(request, releaseContext, changelogSection);
        await this._gitRepository.stagePaths([releaseContext.changelogPath]);
        await this._gitRepository.commit(preparationPolicy.pullRequestTitle);
        await this._gitRepository.pushBranch(PrepareRelease._remoteName, preparationPolicy.workingBranch);

        const pullRequest: PullRequestReference = await this._releasePullRequestCreator.create({
            repository: request.repository,
            releaseTag,
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
