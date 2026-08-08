import type { CommandExecutionResult } from '../command/CommandExecutionResult';
import type { CommandRunner } from '../command/CommandRunner';
import type { ChangelogGenerationRequest } from './ChangelogGenerationRequest';
import type { GitCliffClient } from './GitCliffClient';


export class CommandGitCliffClient implements GitCliffClient {
    private readonly _commandRunner: CommandRunner;

    public constructor(commandRunner: CommandRunner) {
        this._commandRunner = commandRunner;
    }

    public async generate(request: ChangelogGenerationRequest): Promise<string> {
        const commandArguments: string[] = [
            'git-cliff',
            '--config',
            request.configurationPath,
            '--tag-pattern',
            request.tagPattern,
        ];

        if (request.verbose) {
            commandArguments.push('--verbose');
        }

        if (request.strip !== undefined) {
            commandArguments.push('--strip', request.strip);
        }

        if (request.latest) {
            commandArguments.push('--latest');
        }

        if (request.includePath !== undefined) {
            commandArguments.push('--include-path', request.includePath);
        }

        if (request.ignoredTagPattern !== undefined) {
            commandArguments.push('--ignore-tags', request.ignoredTagPattern);
        }

        if (request.revision !== undefined) {
            commandArguments.push(request.revision);
        }

        const result: CommandExecutionResult = await this._commandRunner.execute('npx', commandArguments, {
            workingDirectory: request.workingDirectory,
        });

        return result.standardOutput;
    }
}
