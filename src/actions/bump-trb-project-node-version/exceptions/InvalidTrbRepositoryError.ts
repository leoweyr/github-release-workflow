export class InvalidTrbRepositoryError extends Error {
    public constructor(repositoryValue: string) {
        super(`TRB repository '${repositoryValue}' must use the 'owner/repository' format.`);

        this.name = 'InvalidTrbRepositoryError';
    }
}
