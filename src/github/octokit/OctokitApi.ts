import type { OctokitResponse } from './OctokitResponse';
import type { PullRequestData } from './PullRequestData';
import type { ReleaseData } from './ReleaseData';
import type { RepositoryData } from './RepositoryData';


export interface OctokitApi {
    readonly rest: {
        readonly pulls: {
            create(parameters: {
                readonly owner: string;
                readonly repo: string;
                readonly title: string;
                readonly body: string;
                readonly base: string;
                readonly head: string;
            }): Promise<OctokitResponse<PullRequestData>>;

            list(parameters: {
                readonly owner: string;
                readonly repo: string;
                readonly state: 'open';
                readonly base: string;
                readonly head: string;
                readonly per_page: number;
            }): Promise<OctokitResponse<readonly PullRequestData[]>>;
        };

        readonly repos: {
            createRelease(parameters: {
                readonly owner: string;
                readonly repo: string;
                readonly tag_name: string;
                readonly name: string;
                readonly body: string;
                readonly draft: boolean;
                readonly prerelease: boolean;
                readonly make_latest?: 'false' | 'legacy' | 'true';
            }): Promise<OctokitResponse<ReleaseData>>;

            getReleaseByTag(parameters: {
                readonly owner: string;
                readonly repo: string;
                readonly tag: string;
            }): Promise<OctokitResponse<ReleaseData>>;

            get(parameters: {
                readonly owner: string;
                readonly repo: string;
            }): Promise<OctokitResponse<RepositoryData>>;
        };

        readonly actions: {
            createWorkflowDispatch(parameters: {
                readonly owner: string;
                readonly repo: string;
                readonly workflow_id: string;
                readonly ref: string;
                readonly inputs?: Readonly<Record<string, string>>;
            }): Promise<unknown>;
        };
    };
}
