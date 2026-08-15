# Migrating from v1 to v2 Guide

Update both user-side entry workflows before preparing the first v2 release.

## Update the Prepare Workflow

In `.github/workflows/prepare-release.yml`:

- Update the reusable workflow reference from `@develop` to `@v2.1.0`.
- Rename `base-branch` to `main-branch` and set it to the repository's main branch.
- If configured, rename `node-verions` to `node-version`.

```diff
 jobs:
   call-prepare:
-    uses: leoweyr/github-release-workflow/.github/workflows/reusable-prepare-release.yml@develop
+    uses: leoweyr/github-release-workflow/.github/workflows/reusable-prepare-release.yml@v2.1.0
     with:
-      base-branch: 'master'
-      node-verions: '20'
+      main-branch: 'master'
+      node-version: '20'
     secrets:
       ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Update the Publish Workflow

In `.github/workflows/publish-release.yml`:

- Update the reusable workflow reference from `@develop` to `@v2.1.0`.
- Add the `pull-requests: write` permission.
- Set `main-branch` to `master` or `main`, whichever is the repository's main branch.

```diff
 permissions:
   contents: write
+  pull-requests: write

 jobs:
   call-publish:
-    uses: leoweyr/github-release-workflow/.github/workflows/reusable-publish-release.yml@develop
+    uses: leoweyr/github-release-workflow/.github/workflows/reusable-publish-release.yml@v2.1.0
+    with:
+      main-branch: 'master'
     secrets:
       ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Set `main-branch` explicitly. Do not use the repository's default branch when it is a development branch.

## Follow the v2 Release Flow

- Prerelease versions merge from `prerelease/*` into their persistent `release/*` branch and are not promoted to the main branch.
- Merge `prerelease/*` into `release/*` using **Create a merge commit**, not **Squash and merge** or **Rebase and merge**.
- A stable version is promoted from its `release/*` branch to the configured main branch through a Pull Request. Stable publishing starts after this Pull Request is merged.
- The `release/*` to main branch Pull Request may use merge, squash, or rebase merging.
- Prereleases do not trigger the TRB project node version bump.

## Verify the Migration

- Both reusable workflow references use `@v2.1.0`.
- `prepare-release.yml` does not contain `base-branch` or `node-verions` and sets the correct `main-branch`.
- `publish-release.yml` grants `pull-requests: write` and sets the correct `main-branch`.
