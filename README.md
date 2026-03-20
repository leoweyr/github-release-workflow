![github-release-workflow](https://socialify.git.ci/leoweyr/github-release-workflow/image?description=1&font=KoHo&forks=1&issues=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fleoweyr%2Fgithub-release-workflow%2Frefs%2Fheads%2Fdevelop%2Fassets%2Ficon.svg&name=1&owner=1&pattern=Formal+Invitation&pulls=1&stargazers=1&theme=Light)

> [!IMPORTANT]
> To ensure changelogs are generated correctly, all git commit messages must follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.
>
> Also, you must go to your repository **Settings > Actions > General > Workflow permissions** and enable **"Allow GitHub Actions to create and approve pull requests"**, otherwise the automated release process will fail.

## 🚀 Instant Magic for Your Repository!!!

Add professional release automation to your personal project with a single step:

**Simply copy the `.github/workflows` directory from this repository into your project's root.**

✨ That's it! Your repository is now enchanted.

## ⚙ How It Works

This workflow streamlines your release process into a few simple steps:

1.  **Tag Your Release**: On your development branch (separate from `master` or `main`), create a git tag with a `v` prefix (e.g., `v1.0.0`).
    ```bash
    git tag v1.0.0
    ```

2.  **Push the Tag**: Push the tag to GitHub.
    ```bash
    git push origin v1.0.0
    ```

3.  **Automated Magic**: GitHub Actions will automatically:
    *   Generate a changelog based on your conventional commits.
    *   Create a specific release branch.
    *   Open a Pull Request to your default branch (e.g., `master`).

4.  **Review and Merge**: Review the Pull Request created by the bot.
    *   **Do not modify the Pull Request title or body**, as they are used for the release metadata.
    *   Merge the Pull Request.
    *   The workflow will automatically create a GitHub Release for you.
