export class InvalidGitOutputError extends Error {
    public constructor(operation: string, output: string) {
        super(`Git returned invalid output for '${operation}': '${output}'.`);

        this.name = 'InvalidGitOutputError';
    }
}
