# Repository Guidelines

## Project Overview

This repository is a WXT-based browser extension for Xiaohongshu Web. The current product goal is to reduce feed noise and make Xiaohongshu behave more like a focused search tool.

## Project Structure

Only document the parts that exist in this repo and are relevant to edits:

- `entrypoints/background.ts`: extension background entrypoint.
- `entrypoints/popup/`: popup UI (`index.html`, `main.ts`, `style.css`).
- `entrypoints/rednote.content/`: content script for Xiaohongshu pages.
- `entrypoints/rednote.content/features/`: feature registry, router, shared feature helpers, and individual feature implementations.
- `shared/features.ts`: feature metadata shared across extension surfaces.
- `shared/settings.ts`: shared settings and storage-facing types/defaults.
- `assets/icon.svg`: source icon for `@wxt-dev/auto-icons`.
- `public/`: static assets copied as-is to the build output.
- `wxt.config.ts`: WXT config, manifest permissions, shared auto-import setup, and browser launch args.
- `biome.json`: formatting/linting rules, extending `@maxchang/biome-config`.

Generated directories such as `.output/` and `.wxt/` should not be edited by hand unless the task is explicitly about generated artifacts.

## Build, Dev, and Verification Commands

Use `pnpm` for all package management and scripts.

- `pnpm dev`: Chromium dev build.
- `pnpm dev:firefox`: Firefox dev build.
- `pnpm build`: production Chromium build.
- `pnpm build:firefox`: production Firefox build.
- `pnpm zip`: package Chromium extension.
- `pnpm zip:firefox`: package Firefox extension.
- `pnpm lint`: run Biome checks.
- `pnpm lint:fix`: apply Biome fixes.
- `pnpm typecheck`: run TypeScript type checking.
- `pnpm compile`: alias of TypeScript no-emit compile.

Preferred validation after code changes:

1. `pnpm typecheck`
2. `pnpm lint` or `pnpm lint:fix`

When developing, there is no need to run `pnpm compile` or `pnpm build` after every change; WXT's dev mode handles on-the-fly compilation and hot reload for content scripts and popup.

## Coding Conventions

- Follow existing TypeScript style and Biome formatting; do not introduce a second formatter.
- Prefer implicit deduction of function return types when they are obvious from the implementation, but be explicit for exported functions or when the return type is not immediately clear.
- Prefer small, composable functions over large imperative blocks.
- Use descriptive names for features, settings, storage keys, and DOM selectors.
- Keep content-script logic defensive: Xiaohongshu DOM can change without notice.
- Avoid unnecessary imports from `shared/`, `utils/`, or `composables`-style helpers if WXT auto-import already covers the usage.

## Change Guidelines

- Prefer edits inside existing feature modules before adding new top-level structure.
- Keep feature flags, defaults, and labels consistent between `shared/` definitions and content-script implementations.
- If a change affects user-facing behavior, update `README.md` when the existing description becomes inaccurate.

## Add new feature

When adding a new feature, keep the flow small and consistent:

1. Add the feature metadata to `shared/features.ts` with `id`, `title`, `description`, and `defaultValue`.
2. Create the runtime in `entrypoints/rednote.content/features/impl/<feature-name>.ts`.
3. Export it from `entrypoints/rednote.content/features/impl/index.ts`.
4. Register it in the `runtimeFeatures` map inside `entrypoints/rednote.content/features/index.ts`.
5. If the feature changes what users see or how they use the extension, update `README.md`.

Use this minimal runtime shape:

```ts
import { defineFeatureRuntime } from '../utils'

export const setupExample = defineFeatureRuntime(({ isEnabled, onRouteChange, getCurrentPath }) => {
  const apply = () => {
    // Read current state and apply DOM changes defensively.
    const enabled = isEnabled()
    const path = getCurrentPath()
  }

  const stopListening = onRouteChange(() => {
    apply()
  })

  return {
    refresh: apply,
    dispose: () => {
      stopListening()
      // Undo any DOM side effects here.
    },
  }
})
```

Feature runtimes should be defensive against missing DOM nodes, keep cleanup inside `dispose()`, and make `refresh()` safe to call repeatedly.

## Commit Readiness

Before wrapping up, make sure the changed files pass the most relevant checks and that any skipped verification is called out explicitly.

Follow the conventional commit format for the commit message, with a clear description of the change and its motivation if not obvious.

## References

- WXT docs: https://wxt.dev/llms.txt
