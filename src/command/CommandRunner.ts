import type { CommandExecutionOptions } from './CommandExecutionOptions';
import type { CommandExecutionResult } from './CommandExecutionResult';


export interface CommandRunner {
    execute(
        command: string,
        commandArguments?: readonly string[],
        options?: CommandExecutionOptions,
    ): Promise<CommandExecutionResult>;
}
