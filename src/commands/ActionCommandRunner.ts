import { getExecOutput } from '@actions/exec';
import type { ExecOptions, ExecOutput } from '@actions/exec';

import type { CommandExecutionOptions } from './CommandExecutionOptions';
import type { CommandExecutionResult } from './CommandExecutionResult';
import type { CommandRunner } from './CommandRunner';
import { CommandExecutionError } from './exceptions/CommandExecutionError';


export class ActionCommandRunner implements CommandRunner {
    private static readonly _successfulExitCode: number = 0;

    private static _createEnvironment(environmentOverrides: Readonly<Record<string, string>>): Record<string, string> {
        const environment: Record<string, string> = {};
        const processEnvironmentEntries: [string, string | undefined][] = Object.entries(process.env);

        processEnvironmentEntries.forEach((processEnvironmentEntry: [string, string | undefined]): void => {
            const environmentName: string = processEnvironmentEntry[0];
            const environmentValue: string | undefined = processEnvironmentEntry[1];

            if (environmentValue !== undefined) {
                environment[environmentName] = environmentValue;
            }
        });

        return {
            ...environment,
            ...environmentOverrides,
        };
    }

    private static _createExecutionOptions(options: CommandExecutionOptions): ExecOptions {
        const executionOptions: ExecOptions = {
            ignoreReturnCode: true,
        };

        if (options.workingDirectory !== undefined) {
            executionOptions.cwd = options.workingDirectory;
        }

        if (options.environment !== undefined) {
            executionOptions.env = ActionCommandRunner._createEnvironment(options.environment);
        }

        if (options.silent !== undefined) {
            executionOptions.silent = options.silent;
        }

        return executionOptions;
    }

    private static _isAcceptedExitCode(exitCode: number, acceptedExitCodes: readonly number[]): boolean {
        return acceptedExitCodes.includes(exitCode);
    }

    public async execute(
        command: string,
        commandArguments: readonly string[] = [],
        options: CommandExecutionOptions = {},
    ): Promise<CommandExecutionResult> {
        const executionOptions: ExecOptions = ActionCommandRunner._createExecutionOptions(options);
        const executionOutput: ExecOutput = await getExecOutput(command, [...commandArguments], executionOptions);

        const result: CommandExecutionResult = Object.freeze({
            exitCode: executionOutput.exitCode,
            standardOutput: executionOutput.stdout,
            standardError: executionOutput.stderr,
        });

        const acceptedExitCodes: readonly number[] = options.acceptedExitCodes ?? [
            ActionCommandRunner._successfulExitCode,
        ];

        if (!ActionCommandRunner._isAcceptedExitCode(result.exitCode, acceptedExitCodes)) {
            throw new CommandExecutionError(command, commandArguments, result);
        }

        return result;
    }
}
