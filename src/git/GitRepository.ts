import type { GitAuthor } from './GitAuthor';


export interface GitRepository {
    configureAuthor(author: GitAuthor): Promise<void>;
    createBranch(branchName: string, startPoint?: string): Promise<void>;
    findCommitsBySubject(revision: string, subject: string): Promise<readonly string[]>;
    hasEquivalentPatch(commitRevision: string, targetRevision: string): Promise<boolean>;
    stagePaths(filePaths: readonly string[]): Promise<void>;
    commit(message: string): Promise<void>;
    cherryPick(commitRevision: string): Promise<void>;
    pushBranch(remoteName: string, branchName: string): Promise<void>;
    pushRevisionAsBranch(remoteName: string, sourceRevision: string, branchName: string): Promise<void>;
    resolveCommit(revision: string): Promise<string>;
    getCommitDate(revision: string): Promise<Date>;
    fetchRemoteRevision(remoteName: string, revision: string): Promise<void>;
    fetchRemoteBranch(remoteName: string, branchName: string): Promise<void>;
    remoteBranchExists(remoteName: string, branchName: string): Promise<boolean>;
    isAncestor(ancestorRevision: string, descendantRevision: string): Promise<boolean>;
}
