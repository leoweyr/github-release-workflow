import type { CommandExecutionResult } from '../command/CommandExecutionResult';
import type { CommandRunner } from '../command/CommandRunner';
import type { GitAuthor } from './GitAuthor';
import type { GitRepository } from './GitRepository';
import { InvalidGitOutputError } from './exceptions/InvalidGitOutputError';


export class CommandGitRepository implements GitRepository {
    private static readonly _commitHashPattern: RegExp = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u;
    private static readonly _existsExitCode: number = 0;
    private static readonly _missingExitCode: number = 2;
    private static readonly _notAncestorExitCode: number = 1;

    private readonly _commandRunner: CommandRunner;
    private readonly _workingDirectory: string;

    public constructor(commandRunner: CommandRunner, workingDirectory: string) {
        this._commandRunner = commandRunner;
        this._workingDirectory = workingDirectory;
    }

    private async _execute(
        commandArguments: readonly string[],
        acceptedExitCodes: readonly number[] = [CommandGitRepository._existsExitCode],
    ): Promise<CommandExecutionResult> {
        return this._commandRunner.execute('git', commandArguments, {
            workingDirectory: this._workingDirectory,
            acceptedExitCodes,
        });
    }

    public async configureAuthor(author: GitAuthor): Promise<void> {
        await this._execute(['config', 'user.name', author.name]);
        await this._execute(['config', 'user.email', author.email]);
    }

    public async createBranch(branchName: string, startPoint?: string): Promise<void> {
        const commandArguments: string[] = ['checkout', '-b', branchName];

        if (startPoint !== undefined) {
            commandArguments.push(startPoint);
        }

        await this._execute(commandArguments);
    }

    public async stagePaths(filePaths: readonly string[]): Promise<void> {
        await this._execute(['add', '--', ...filePaths]);
    }

    public async commit(message: string): Promise<void> {
        await this._execute(['commit', '-m', message]);
    }

    public async pushBranch(remoteName: string, branchName: string): Promise<void> {
        await this._execute(['push', remoteName, branchName]);
    }

    public async pushRevisionAsBranch(
        remoteName: string,
        sourceRevision: string,
        branchName: string,
    ): Promise<void> {
        await this._execute(['push', remoteName, `${sourceRevision}:refs/heads/${branchName}`]);
    }

    public async resolveCommit(revision: string): Promise<string> {
        const result: CommandExecutionResult = await this._execute([
            'rev-parse',
            '--verify',
            `${revision}^{commit}`,
        ]);
        const commitHash: string = result.standardOutput.trim();

        if (!CommandGitRepository._commitHashPattern.test(commitHash)) {
            throw new InvalidGitOutputError('resolve commit', commitHash);
        }

        return commitHash;
    }

    public async getCommitDate(revision: string): Promise<Date> {
        const result: CommandExecutionResult = await this._execute(['show', '-s', '--format=%cI', revision]);
        const dateValue: string = result.standardOutput.trim();
        const commitDate: Date = new Date(dateValue);

        if (Number.isNaN(commitDate.getTime())) {
            throw new InvalidGitOutputError('read commit date', dateValue);
        }

        return commitDate;
    }

    public async fetchRemoteBranch(remoteName: string, branchName: string): Promise<void> {
        await this._execute([
            'fetch',
            '--no-tags',
            remoteName,
            `refs/heads/${branchName}:refs/remotes/${remoteName}/${branchName}`,
        ]);
    }

    public async remoteBranchExists(remoteName: string, branchName: string): Promise<boolean> {
        const result: CommandExecutionResult = await this._execute(
            ['ls-remote', '--exit-code', '--heads', remoteName, `refs/heads/${branchName}`],
            [CommandGitRepository._existsExitCode, CommandGitRepository._missingExitCode],
        );

        return result.exitCode === CommandGitRepository._existsExitCode;
    }

    public async isAncestor(ancestorRevision: string, descendantRevision: string): Promise<boolean> {
        const result: CommandExecutionResult = await this._execute(
            ['merge-base', '--is-ancestor', ancestorRevision, descendantRevision],
            [CommandGitRepository._existsExitCode, CommandGitRepository._notAncestorExitCode],
        );

        return result.exitCode === CommandGitRepository._existsExitCode;
    }
}
