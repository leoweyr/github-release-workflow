# Migrating from v1 to v2 Guide

Update both user-side entry workflows before preparing the first v2 release.

## Update the Prepare Workflow

In `.github/workflows/prepare-release.yml`:

- Remove `base-branch`.
- If configured, rename `node-verions` to `node-version`.

```diff
 jobs:
   call-prepare:
     with:
-      base-branch: 'master'
-      node-verions: '20'
+      node-version: '20'
     secrets:
       ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Omit the `with` block when no other prepare workflow inputs are configured.

## Update the Publish Workflow

In `.github/workflows/publish-release.yml`:

- Add the `pull-requests: write` permission.
- Set `main-branch` to `master` or `main`, whichever is the repository's main branch.

```diff
 permissions:
   contents: write
+  pull-requests: write

 jobs:
   call-publish:
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

- `prepare-release.yml` does not contain `base-branch` or `node-verions`.
- `publish-release.yml` grants `pull-requests: write` and sets the correct `main-branch`.
