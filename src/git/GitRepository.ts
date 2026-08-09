import type { GitAuthor } from './GitAuthor';


export interface GitRepository {
    configureAuthor(author: GitAuthor): Promise<void>;
    createBranch(branchName: string, startPoint?: string): Promise<void>;
    stagePaths(filePaths: readonly string[]): Promise<void>;
    commit(message: string): Promise<void>;
    pushBranch(remoteName: string, branchName: string): Promise<void>;
    pushRevisionAsBranch(remoteName: string, sourceRevision: string, branchName: string): Promise<void>;
    resolveCommit(revision: string): Promise<string>;
    getCommitDate(revision: string): Promise<Date>;
    fetchRemoteBranch(remoteName: string, branchName: string): Promise<void>;
    remoteBranchExists(remoteName: string, branchName: string): Promise<boolean>;
    isAncestor(ancestorRevision: string, descendantRevision: string): Promise<boolean>;
}
