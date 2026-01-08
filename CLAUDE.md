# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a monorepo containing JavaScript utility packages published under the `@tmbr` npm scope. All packages use ES modules.

## Commands

**Run all tests:**
```bash
npm test
```

**Run tests for a specific package:**
```bash
node emitter/test.js
node store/test.js
node utils/test.js
```

**Generate utils documentation (updates README):**
```bash
npm run docs --workspace=utils
```

## Architecture

### Packages

- **@tmbr/emitter** - Event emitter class with `on`, `off`, `emit`, `has`, and `destroy` methods
- **@tmbr/store** - State management class built on emitter, supports subscribing to specific keys
- **@tmbr/utils** - Collection of utility functions (DOM helpers, math, type checks, etc.)

### Package Dependencies

`store` depends on `emitter` and `utils`. The packages are linked via npm workspaces.

### Code Patterns

- Each utility in `utils/lib/` is a single-function module exported from `utils/index.js`
- Tests use the `uvu` test framework with `snoop` for spies
- DOM-dependent tests use `jsdom` (see `utils/test.js` for setup pattern)
- All packages export a default class or named functions as ES modules
