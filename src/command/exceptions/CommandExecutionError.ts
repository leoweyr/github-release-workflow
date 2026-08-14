import type { CommandExecutionResult } from '../CommandExecutionResult';


export class CommandExecutionError extends Error {
    private readonly _command: string;
    private readonly _commandArguments: readonly string[];
    private readonly _result: CommandExecutionResult;

    public constructor(command: string, commandArguments: readonly string[], result: CommandExecutionResult) {
        super(`Command '${command}' exited with code ${result.exitCode}.`);

        this.name = 'CommandExecutionError';
        this._command = command;
        this._commandArguments = [...commandArguments];
        this._result = { ...result };
    }

    public get command(): string {
        return this._command;
    }

    public get commandArguments(): readonly string[] {
        return [...this._commandArguments];
    }

    public get result(): CommandExecutionResult {
        return { ...this._result };
    }
}
