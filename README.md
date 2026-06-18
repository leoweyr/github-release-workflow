![github-release-workflow](https://socialify.git.ci/leoweyr/github-release-workflow/image?description=1&font=KoHo&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fleoweyr%2Fgithub-release-workflow%2Frefs%2Fheads%2Fdevelop%2Fassets%2Ficon.svg&name=1&owner=1&pattern=Formal+Invitation&theme=Light)

![Usage](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fabacus.jasoncameron.dev%2Fget%2Fleoweyr%2Fgithub-release-workflow-usage&query=%24.value&label=Usage&color=blue&suffix=%20times)
![Used by Stats](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/leoweyr/0575adecfc13c95f281dfccfe5b76063/raw/github-release-workflow-used-by-stats.json)

> [!IMPORTANT]
> To ensure changelogs are generated correctly, all git commit messages must follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.
>
> Also, you must go to your repository **Settings > Actions > General > Workflow permissions** and enable **"Allow GitHub Actions to create and approve pull requests"**, otherwise the automated release process will fail.

## 🚀 Instant Magic for Your Repository!!!

Add professional release automation to your personal project with a single step:

**Copy the `prepare-release.yml` and `publish-release.yml` files from `.github/workflows` into your project's `.github/workflows` directory.**

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
    *   The workflow will automatically create coordinated releases across GitHub and supported package registries.

## 📦 Optional Publishing

> [!NOTE]
>
> If the required inputs or secrets for a release target are not configured, publishing for that target will not start.

Configure target publishing in your user-side entry workflow (`.github/workflows/publish-release.yml`):

| Release Target                                                                                                       | Required                                            | User-Side Inputs (`with`)                                                                                                 |
|----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| GitHub Release                                                                                                       | `ACCESS_TOKEN` (Mapped from `secrets.GITHUB_TOKEN`) | None                                                                                                                      |
| NPM                                                                                                                  | `NPM_TOKEN`                                         | `npm-node-version` (Default `20`)<br/>`npm-package-dir` (Default `.`)<br/>`npm-deploy-command` (Default `npm run deploy`) |
| [TODO Requirement Blueprint](https://github.com/leoweyr/todo-requirement-blueprint-spec) (Bump Project Node Version) | `trb-repository`<br/>`trb-project-node-name`        |                                                                                                                           |

## 🪆 Mono-repo Support

This workflow also releases individual sub-packages inside a mono-repo. Each sub-package gets its own version, changelog and GitHub Release, while the overall flow stays identical to the monolith case.

1. **Declare your sub-packages**

   In your user-side entry workflow (`.github/workflows/prepare-release.yml`), declare every sub-package as a `name → workspace` mapping via the `packages` input, and add the sub-package tag pattern to the trigger:

   ```yaml
   on:
     push:
       tags:
         - 'v*'    # Monolith release.
         - '*/v*'  # Mono-repo sub-package release.
   
   
   jobs:
     call-prepare:
       uses: leoweyr/github-release-workflow/.github/workflows/reusable-prepare-release.yml@develop
       with:
         base-branch: 'master'
         packages: |
           {
             "core": "packages/core",
             "cli": "packages/cli"
           }
       secrets:
         ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

   The **workspace** is the work directory that binds a sub-package's changes. Only commits that touch files inside it are considered for that sub-package's changelog.

   Likewise, sub-packages that need different publish settings are configured via the `package-overrides` input in your user-side entry workflow (`.github/workflows/publish-release.yml`), the same way as `packages`:

   ```yaml
   jobs:
     call-publish:
       uses: leoweyr/github-release-workflow/.github/workflows/reusable-publish-release.yml@develop
       with:
         package-overrides: |
           {
             "core": {
               "npm-package-dir": "packages/core"
             },
             "cli": {
               "npm-package-dir": "packages/cli"
             }
           }
       secrets:
         ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
         NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
   ```

2. **Tag a sub-package release**

   Use a tag in the form `<package>/v<semver>`:

   ```bash
   git tag core/v1.0.0
   git push origin core/v1.0.0
   ```

How it differs from a monolith release:

| Aspect                     | Monolith                          | Mono-repo Sub-package                                             |
|----------------------------|-----------------------------------|-------------------------------------------------------------------|
| Trigger Tag                | `v1.0.0`                          | `core/v1.0.0`                                                     |
| Release Pull Request Title | `release: v1.0.0`                 | `release: core@v1.0.0`                                            |
| Changelog Commit Range     | Latest commit → previous `v*` tag | Latest commit → previous `core/v*` tag                            |
| Commit Filtering           | All conventional commits          | Only commits that modified files inside the sub-package workspace |
| Changelog Location         | `CHANGELOG.md` (project root)     | `packages/core/CHANGELOG.md` (inside the workspace)               |
| GitHub Release Title       | `1.0.0`                           | `core@v1.0.0`                                                     |
