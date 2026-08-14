import type { GitHubRepositoryReference } from './GitHubRepositoryReference';


export interface WorkflowDispatchRequest {
    readonly repository: GitHubRepositoryReference;
    readonly workflowIdentifier: string;
    readonly reference: string;
    readonly inputs?: Readonly<Record<string, string>>;
}
