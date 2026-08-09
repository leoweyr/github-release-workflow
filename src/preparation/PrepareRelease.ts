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
import { MissingChangelogVersionHeadingError } from './exceptions/MissingChangelogVersionHeadingError';


export class PrepareRelease {
    private static readonly _firstVersionHeadingPattern: RegExp = /^# \[|^# [0-9]/mu;

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

        const tagCommitHash: string = await this._gitRepository.resolveCommit(
            `refs/tags/${releaseContext.tagName}`,
        );

        const changelogContent: string = await this._gitCliffClient.generate({
            workingDirectory: this._workingDirectory,
            configurationPath: request.changelogConfigurationPath,
            tagPattern: releaseContext.tagPattern,
            ...(releaseContext.includePath === null ? {} : { includePath: releaseContext.includePath }),
            revision: tagCommitHash,
            latest: false,
            verbose: true,
            environment: request.gitCliffEnvironment,
        });

        await this._fileSystem.createDirectory(dirname(changelogFilePath));
        await this._fileSystem.writeTextFile(changelogFilePath, changelogContent);
    }

    public async execute(request: PrepareReleaseRequest): Promise<PrepareReleaseResult> {
        const releaseContext: ReleaseContext = ReleaseContext.resolve(
            ReleaseTag.fromTagName(request.tagName),
            request.packageWorkspaces,
        );

        await this._gitRepository.configureAuthor(request.author);
        await this._gitRepository.createBranch(releaseContext.releaseBranch);

        const changelogSection: string = await this._generateLatestChangelogSection(request, releaseContext);

        await this._updateChangelog(request, releaseContext, changelogSection);
        await this._gitRepository.stagePaths([releaseContext.changelogPath]);
        await this._gitRepository.commit(`release: ${releaseContext.releaseLabel}`);
        await this._gitRepository.pushBranch('origin', releaseContext.releaseBranch);

        const pullRequest: PullRequestReference = await this._gitHubClient.createPullRequest({
            repository: request.repository,
            title: `release: ${releaseContext.releaseLabel}`,
            body: PrepareRelease._removeSectionHeading(changelogSection),
            baseBranch: request.baseBranch,
            headBranch: releaseContext.releaseBranch,
        });

        return {
            tagName: releaseContext.tagName,
            releaseVersion: releaseContext.releaseVersion,
            releaseLabel: releaseContext.releaseLabel,
            changelogPath: releaseContext.changelogPath,
            releaseBranch: releaseContext.releaseBranch,
            pullRequest,
        };
    }
}
