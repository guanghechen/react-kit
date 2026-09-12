<header>
  <div align="center">
    <a href="#license">
      <img
        alt="License"
        src="https://img.shields.io/github/license/guanghechen/react-kit"
      />
    </a>
    <a href="https://github.com/guanghechen/react-kit/tags">
      <img
        alt="Package Version"
        src="https://img.shields.io/github/v/tag/guanghechen/react-kit?include_prereleases&sort=semver"
      />
    </a>
    <a href="https://github.com/guanghechen/react-kit/search?l=typescript">
      <img
        alt="Github Top Language"
        src="https://img.shields.io/github/languages/top/guanghechen/react-kit"
      />
    </a>
    <a href="https://github.com/nodejs/node">
      <img
        alt="Node.js Version"
        src="https://img.shields.io/node/v/@guanghechen/rollup-config-tsx"
      />
    </a>
    <a href="https://github.com/guanghechen/react-kit/actions/workflows/ci.yml">
      <img
        alt="CI Workflow"
        src="https://github.com/guanghechen/react-kit/actions/workflows/ci.yml/badge.svg"
      />
    </a>
    <a href="https://github.com/vitest-dev/vitest">
      <img
        alt="Tested with Vitest"
        src="https://img.shields.io/badge/tested_with-vitest-6E9F18.svg"
      />
    </a>
    <a href="https://biomejs.dev/">
      <img
        alt="Code Style: Biome"
        src="https://img.shields.io/badge/code_style-Biome-60a5fa.svg?style=flat-square"
      />
    </a>
  </div>
</header>


A monorepo contains some utility methods / hooks / components for building react application.

## Overview

Package                           | Description
:--------------------------------:|:--------------------------
[@guanghechen/dom-blob][]         | Utilities for processing blob objects (i.e., download / create).
[@guanghechen/react-confetti][]   | Simple confetti particle in react.
[@guanghechen/react-hooks][]      | Custom React hooks.


## Development checks

Run `pnpm format` to apply Biome formatting, import organization, and safe lint fixes.
Run `pnpm lint` to check them without modifying files; CI runs the same check.
The pre-commit hook applies Biome to staged JavaScript, TypeScript, and JSON files.
`@guanghechen/githooks` installs hooks from `package.json` during `postinstall`,
skipping CI. Generated hooks live in the ignored `.githooks/` directory.
Use Node.js 24.11 or newer in the Node.js 24 release line for development.
Run `pnpm typecheck`, `pnpm build`, `pnpm test:dist`, and `pnpm test:coverage`
for the remaining checks. tsdown builds ESM, CJS, and bundled declarations into
each package's existing `lib/` entry points. `pnpm build:production` omits source maps.
CI builds and runs unit tests with coverage on Node.js 24, then checks the outputs
on Node.js 20, 22, and 24.

Test type checking uses `skipLibCheck` to tolerate upstream declaration errors in
Vitest 5.0.0. Source and test code remain checked; `test:dist` separately checks
public declarations with `--strict` and without `skipLibCheck`.

Biome's Promise rules are enabled but remain nursery rules, so their type analysis
is not identical to typescript-eslint. Import cycles and undeclared dependencies
are checked; the cycle rule does not reject self-imports. React hook dependency
and call-site rules remain disabled, matching the previous ESLint setup.
Markdown and YAML are outside the formatter's current coverage.

## License

react-kit is [MIT licensed](https://github.com/guanghechen/react-kit/tree/release-2.x.x/LICENSE).


[homepage]: https://github.com/guanghechen/react-kit/tree/release-2.x.x
[@guanghechen/dom-blob]: ./packages/dom-blob
[@guanghechen/react-confetti]: ./packages/react-confetti
[@guanghechen/react-hooks]: ./packages/react-hooks
