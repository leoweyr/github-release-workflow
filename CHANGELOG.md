# Changelog

All notable changes to this project will be documented in this file.

# [1.2.0](https://github.com/leoweyr/github-release-workflow/compare/v1.1.0...v1.2.0) (2026-04-05)
### Bug Fixes

* correct NPM_TOKEN gating output ([6173ab3](https://github.com/leoweyr/github-release-workflow/commit/6173ab3a2a1f676b85100f51e11d6a96843b2e73)) [@leoweyr](https://github.com/leoweyr)
* **publish-release:** align parameters in verify TRB inputs ([7bf326f](https://github.com/leoweyr/github-release-workflow/commit/7bf326f99154667914f3cbb5daad4a392e3a7a29)) [@leoweyr](https://github.com/leoweyr)
* **publish-release:** align TRB local action path with synced directory ([e9f7736](https://github.com/leoweyr/github-release-workflow/commit/e9f7736bd68503c238280e1dcec553aa6d794a5e)) [@leoweyr](https://github.com/leoweyr)


### Features

* support trb project node version bump ([90eecbf](https://github.com/leoweyr/github-release-workflow/commit/90eecbfa1ae50f415195089c58eaac2139a1ef8f)) [@leoweyr](https://github.com/leoweyr)



# [1.1.0](https://github.com/leoweyr/github-release-workflow/compare/v1.0.1...v1.1.0) (2026-04-04)
### Features

* support npm publish ([7191ff0](https://github.com/leoweyr/github-release-workflow/commit/7191ff0f6d537348fc5ccf6115ecbfac8c5dbd19)) [@leoweyr](https://github.com/leoweyr)



# [1.0.1](https://github.com/leoweyr/github-release-workflow/compare/v1.0.0...v1.0.1) (2026-03-29)
### Bug Fixes

* ensure revert commits follow conventional format in changelog ([dd5ada5](https://github.com/leoweyr/github-release-workflow/commit/dd5ada5e8272905e52de6406c80e15e7687b5a66)) [@leoweyr](https://github.com/leoweyr)
* prioritize revert commits parsing to prevent misclassification as fixes ([1eaef1a](https://github.com/leoweyr/github-release-workflow/commit/1eaef1a20d01fc9c1364450edf8835ec28a8cef5)) [@leoweyr](https://github.com/leoweyr)
* use type field to correctly classify revert commits in change log ([167d2d0](https://github.com/leoweyr/github-release-workflow/commit/167d2d00feabc34b87df97d9813c5b1ab7a2d27e)) [@leoweyr](https://github.com/leoweyr)
* preserve original type/scope in revert commit preprocessing ([026c69b](https://github.com/leoweyr/github-release-workflow/commit/026c69bca35934a55b410dfcb0967c04a45784b5)) [@leoweyr](https://github.com/leoweyr)
* **cliff:** classify build commits under DevOps ([5f388b2](https://github.com/leoweyr/github-release-workflow/commit/5f388b21e821991109aa423c44000d0c1636571f)) [@leoweyr](https://github.com/leoweyr)
* make release base branch configurable via reusable workflow input ([80556c5](https://github.com/leoweyr/github-release-workflow/commit/80556c58d324283358c651fee2049b8b030d62cd)) [@leoweyr](https://github.com/leoweyr)


### Features

* add tracker for reusable workflow usage ([86c093b](https://github.com/leoweyr/github-release-workflow/commit/86c093b0a8ea79899530578d3a86c452cd1cdb4c)) [@leoweyr](https://github.com/leoweyr)


### DevOps

* add update used by repos stats workflow ([1c00f3d](https://github.com/leoweyr/github-release-workflow/commit/1c00f3daa4c7858d75a591fe313472e561493709)) [@leoweyr](https://github.com/leoweyr)
* stabilize reusable workflow dependency search ([4c3e192](https://github.com/leoweyr/github-release-workflow/commit/4c3e1924b3628575dd60216fd88c1699834b193e)) [@leoweyr](https://github.com/leoweyr)



# [1.0.0] (2026-03-20)
### Bug Fixes

* move reusable workflows back to .github/workflows directory ([0b0676e](https://github.com/leoweyr/github-release-workflow/commit/0b0676e413f95b39d33c79d64ffc0259a3783206)) [@leoweyr](https://github.com/leoweyr)
* add missing reusable release workflows ([456d0c9](https://github.com/leoweyr/github-release-workflow/commit/456d0c9348aad3d41e1d4b61aca8f7cd50194261)) [@leoweyr](https://github.com/leoweyr)
* rename reserved GITHUB_TOKEN secret in reusable workflows ([8d2afaa](https://github.com/leoweyr/github-release-workflow/commit/8d2afaa30e97c3c735bfe39b1d822879d834d4de)) [@leoweyr](https://github.com/leoweyr)
* correct git-cliff config path to prevent fallback to default ([7aef3e8](https://github.com/leoweyr/github-release-workflow/commit/7aef3e84c53bacded51601db6dcab4b9e765634e)) [@leoweyr](https://github.com/leoweyr)


### Features

* add prepare release workflow ([4bec90f](https://github.com/leoweyr/github-release-workflow/commit/4bec90f7d44eda66efce0e48bec8079a5c98430c)) [@leoweyr](https://github.com/leoweyr)
* add publish release workflow ([20daca8](https://github.com/leoweyr/github-release-workflow/commit/20daca810acd33ee6071d7e5668fca95e203e797)) [@leoweyr](https://github.com/leoweyr)
* add user-facing workflows ([047bf99](https://github.com/leoweyr/github-release-workflow/commit/047bf996a00bb3fae423b17cb3d31a9392184b65)) [@leoweyr](https://github.com/leoweyr)
* add change log config ([4b667a0](https://github.com/leoweyr/github-release-workflow/commit/4b667a058ca7d14aa9960b7834262f5d7ee43a15)) [@leoweyr](https://github.com/leoweyr)


### Documentation

* update readme with usage instructions ([7e15921](https://github.com/leoweyr/github-release-workflow/commit/7e15921622d59b01fa1f571a707ca4ffad7d5a94)) [@leoweyr](https://github.com/leoweyr)
* **readme:** add banner ([e81214e](https://github.com/leoweyr/github-release-workflow/commit/e81214ea480b1bbd1c63ea78cb7c4c32af085513)) [@leoweyr](https://github.com/leoweyr)


### Miscellaneous Tasks

* move reusable workflows to src ([e48851c](https://github.com/leoweyr/github-release-workflow/commit/e48851ca6f5f92f075fae900cfc1332b7a507a20)) [@leoweyr](https://github.com/leoweyr)
* add icon ([04e730f](https://github.com/leoweyr/github-release-workflow/commit/04e730fc0a68c554c8b40f65ec949cdc4763ee73)) [@leoweyr](https://github.com/leoweyr)
* correct eye perspective in icon ([2ad0a73](https://github.com/leoweyr/github-release-workflow/commit/2ad0a7312fc8b75b7945679a71845ca68efbe43b)) [@leoweyr](https://github.com/leoweyr)



<!-- Generated by git-cliff. -->
