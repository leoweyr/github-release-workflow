import type { ChangelogStrip } from './enums/ChangelogStrip';


export interface ChangelogGenerationRequest {
    readonly workingDirectory: string;
    readonly configurationPath: string;
    readonly tagPattern: string;
    readonly includePath?: string;
    readonly ignoredTagPattern?: string;
    readonly revision?: string;
    readonly latest: boolean;
    readonly verbose: boolean;
    readonly strip?: ChangelogStrip;
}
