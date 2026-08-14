export interface CommandExecutionOptions {
    readonly workingDirectory?: string;
    readonly environment?: Readonly<Record<string, string>>;
    readonly silent?: boolean;
    readonly acceptedExitCodes?: readonly number[];
}
