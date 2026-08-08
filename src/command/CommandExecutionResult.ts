export interface CommandExecutionResult {
    readonly exitCode: number;
    readonly standardOutput: string;
    readonly standardError: string;
}
