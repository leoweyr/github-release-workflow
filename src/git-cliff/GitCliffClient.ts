import type { ChangelogGenerationRequest } from './ChangelogGenerationRequest';


export interface GitCliffClient {
    generate(request: ChangelogGenerationRequest): Promise<string>;
}
