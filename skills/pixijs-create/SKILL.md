---
name: pixijs-create
description: "Use this skill when scaffolding a new PixiJS v8 project with the create-pixi CLI or adding PixiJS to an existing project. Covers npm/yarn/pnpm/bun create commands, interactive vs non-interactive flows, bundler vs creation template categories, available template presets (bundler-vite, bundler-webpack, bundler-esbuild, bundler-import-map, creation-web, framework-react, extension-default), Node version requirements, `npm install pixi.js` for existing projects, TypeScript 5/6/7 tsconfig setup (moduleResolution, @webgpu/types, @types/web), post-scaffold dev flow, and the Vite top-level-await production-build gotcha. Triggers on: create pixi.js, npm create, npm install pixi.js, scaffold, template, bundler-vite, bundler-webpack, creation-web, framework-react, new project, existing project, getting started, quick start, TypeScript, tsconfig, moduleResolution, @webgpu/types, @types/web, Cannot find name GPUTextureUsage."
license: MIT
---

`create pixi.js` is the official CLI for scaffolding a new PixiJS v8 project. Run it with any package manager (`npm`, `yarn`, `pnpm`, `bun`) and pick a template from the interactive menu, or pass `--template` to skip prompts. It writes a self-contained project folder; you then `cd` in, install dependencies, and run the dev script.

## Quick Start

Scaffold a new project with interactive prompts:

```bash
npm create pixi.js@latest
```

Or skip prompts by passing a project name and template:

```bash
npm create pixi.js@latest my-game -- --template bundler-vite
```

Then:

```bash
cd my-game
npm install
npm run dev
```

Requires Node.js 18+ or 20+. Some templates (notably `creation-web` and `framework-react`) may require a newer Node version; the package manager will warn if so.

### Adding PixiJS to an existing project

If you already have a bundler, framework, or project set up, skip the CLI and install the package directly:

```bash
npm install pixi.js
```

Then import from `pixi.js` and construct an `Application` as shown in `pixijs-application`. The CLI templates are a convenience for new projects; they don't add anything to the library that `npm install pixi.js` can't give you.

**Related skills:** `pixijs-application` (how the scaffolded `new Application()` + `app.init()` entry point works), `pixijs-core-concepts` (renderers and the render loop), `pixijs-scene-core-concepts` (scene graph fundamentals for the first things you'll add to the stage), `pixijs-assets` (loading textures, fonts, and bundles the template expects you to drop into `public/` or `src/assets/`).

## Core Patterns

### Choose a package manager

The command is the same shape for every package manager:

```bash
npm create pixi.js@latest
yarn create pixi.js
pnpm create pixi.js
bun create pixi.js
```

Under npm 7+ you must pass a `--` before CLI flags so npm doesn't consume them:

```bash
npm create pixi.js@latest my-game -- --template bundler-vite
```

Yarn, pnpm, and bun don't need the extra separator:

```bash
yarn create pixi.js my-game --template bundler-vite
pnpm create pixi.js my-game --template bundler-vite
bun create pixi.js my-game --template bundler-vite
```

Use `.` as the project name to scaffold into the current directory.

### Interactive flow

Running with no arguments walks through prompts:

1. Project name (defaults to `pixi-project`).
2. Framework / template category.
3. Variant (TypeScript vs JavaScript where applicable).
4. Whether to install dependencies immediately (some runners).

At the end, the CLI prints the `cd` + install + dev commands for the manager you invoked it with.

### Non-interactive flow

Pass a project name and `--template` to skip all prompts. This is the form you want for scripts, CI, and quickstart docs:

```bash
npm create pixi.js@latest my-game -- --template bundler-vite
```

### Available template presets

Templates fall into two categories:

- **Bundler templates** (`bundler-*`): generic PixiJS setup wired up with your bundler of choice. Use one of these when you want to pick your own structure.
- **Creation templates** (`creation-*`): platform-tailored starters with extras already wired in (AssetPack, sound, UI, scene routing). Use one of these when you want batteries included.
- **Framework templates** (`framework-*`): PixiJS embedded inside a host framework like React.
- **Extension templates** (`extension-*`): scaffolding for building a reusable PixiJS package.

For most new projects, `bundler-vite` is the recommended starting point.

| Template             | What you get                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `bundler-vite`       | Vite + TypeScript PixiJS project. The default first-stop template.                                           |
| `bundler-vite-js`    | Vite + plain JavaScript.                                                                                     |
| `bundler-webpack`    | Webpack + TypeScript.                                                                                        |
| `bundler-webpack-js` | Webpack + plain JavaScript.                                                                                  |
| `bundler-esbuild`    | esbuild + TypeScript.                                                                                        |
| `bundler-esbuild-js` | esbuild + plain JavaScript.                                                                                  |
| `bundler-import-map` | No-bundler setup using a browser import map (good for learning / demos).                                     |
| `creation-web`       | PixiJS Creation Engine web template with scene-based game scaffolding, AssetPack, sound, and UI integration. |
| `framework-react`    | React + TypeScript + PixiJS via the `@pixi/react` package.                                                   |
| `framework-react-js` | React + plain JavaScript + PixiJS.                                                                           |
| `extension-default`  | Starter for building a reusable PixiJS extension/package.                                                    |

The live list is maintained in the `create-pixi` repo; run `npm create pixi.js@latest` without arguments to see the current menu if you need to confirm.

### Post-scaffold flow

Every template ships with the same three-step onboarding:

```bash
cd my-game
npm install
npm run dev
```

`npm run dev` starts the local dev server on the default port (Vite 5173, webpack 8080, etc.; the template's README has the exact number). Changes to `src/` hot-reload without reloading the whole page.

Other scripts every template exposes (names may vary slightly by preset):

- `npm run build`: produce a production build in `dist/`.
- `npm run preview` / `npm run serve`: serve the production build locally.
- `npm run lint`: run the template's configured linter if it ships one.

### Scaffolding into an existing directory

Use `.` as the project name to write into the current working directory. The CLI refuses to run if non-empty and conflicting files exist unless you confirm the prompt.

```bash
mkdir my-game
cd my-game
npm create pixi.js@latest . -- --template bundler-vite
```

### TypeScript setup

PixiJS supports WebGPU, so its type declarations depend on the WebGPU types. Where those come from depends on your TypeScript version.

- **TypeScript 5:** no WebGPU types are built in, so PixiJS adds `@webgpu/types` for you. No additional setup required.
- **TypeScript 6 and 7:** the WebGPU types are built into the `"dom"` library, but some releases leave parts out, such as `GPUTextureUsage`. Use `@types/web`, which has the full set, in place of `"dom"`. Remove `@webgpu/types` from `types` if it's there, since it conflicts with the built-in types.

```bash
npm install --save-dev @types/web
```

```json
{
  "compilerOptions": {
    "lib": ["esnext"],
    "types": ["@types/web"]
  }
}
```

## Next steps

After `npm run dev` starts, the template opens on a blank or bunny-sprite scene. The usual progression is:

1. Read `pixijs-application` to understand how the template's entry point constructs `new Application()` and calls `await app.init(...)`, how `app.stage` / `app.renderer` / `app.canvas` hang together, and how the ResizePlugin and TickerPlugin behave by default.
2. Read `pixijs-core-concepts` for the renderer and render-loop mental model.
3. Read `pixijs-scene-core-concepts` before adding your first non-trivial scene so you know the container-vs-leaf rule upfront.
4. Drop in textures via `pixijs-assets` once you're ready to load real art.

## Common Mistakes

### [HIGH] Missing `--` separator on npm 7+

Wrong:

```bash
npm create pixi.js@latest my-game --template bundler-vite
```

Correct:

```bash
npm create pixi.js@latest my-game -- --template bundler-vite
```

npm 7+ consumes flags after the package spec unless you pass `--` to forward them. Without the separator, the CLI ignores `--template` and drops back to the interactive prompt. Yarn, pnpm, and bun don't need the separator.


### [MEDIUM] Running with an old Node version

PixiJS requires Node 18+ or 20+. Some templates (framework-react, creation-web) expect a newer Node for their tooling. Upgrade Node before re-running the CLI if you see an "engines" warning from your package manager.


### [MEDIUM] Top-level `await app.init()` broken in Vite production builds

On Vite versions `<=6.0.6`, top-level `await` works in dev but breaks in production builds, so a `bundler-vite` project that does this at module scope will fail after `npm run build`:

```ts
const app = new Application();
await app.init({ resizeTo: window }); // broken at module top level in prod
```

Wrap the init in an async IIFE instead:

```ts
(async () => {
  const app = new Application();
  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);
})();
```

Upgrading Vite past 6.0.6 also resolves it, but the IIFE pattern is safe on every version and matches the PixiJS quick-start guide.


### [HIGH] Keeping `@webgpu/types` in `types` on TypeScript 6 or 7

Wrong:

```json
{
  "compilerOptions": {
    "types": ["@webgpu/types"]
  }
}
```

Correct: remove the `"@webgpu/types"` entry and keep any others.

TypeScript 6 and 7 declare the WebGPU types in their built-in `"dom"` library, so `@webgpu/types` declares them a second time. With `skipLibCheck: false` that produces dozens of conflicting-declaration errors inside `lib.dom.d.ts` and `@webgpu/types`. Keep it on TypeScript 5 only, where PixiJS loads it for you anyway.


### [MEDIUM] `Cannot find name 'GPUTextureUsage'` on TypeScript 6 or 7

Up to TypeScript 6.0.3 and 7.0.2, the built-in `"dom"` library has no WebGPU flag constants (`GPUBufferUsage`, `GPUColorWrite`, `GPUMapMode`, `GPUShaderStage`, `GPUTextureUsage`), so raw WebGPU code that uses them fails with `TS2552`. Adding `@webgpu/types` back only compiles with `skipLibCheck: true`, because it conflicts with the built-in types. Install `@types/web` 0.0.352 or later, drop `"dom"` from `lib`, and add `"@types/web"` to `types` alongside any existing entries, as shown in [TypeScript setup](#typescript-setup).


### [MEDIUM] `moduleResolution: "node"` breaks subpath imports

Wrong:

```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

Correct:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

`"node"` (also called `"node10"`) ignores the `exports` field in the PixiJS `package.json`, so `import 'pixi.js/advanced-blend-modes'` and other subpath imports don't resolve. TypeScript 6 reports `TS2882` for them and deprecates the setting (`TS5107`); TypeScript 7 removes it (`TS5108`). Use `"bundler"` if you use a bundler, or `"nodenext"` otherwise.


## API Reference

- [create-pixi on GitHub](https://github.com/pixijs/create-pixi)
- [create-pixi documentation site](https://pixijs.io/create-pixi/)
- [Application](https://pixijs.download/release/docs/app.Application.html.md): the class the generated entry point instantiates.
- [TypeScript guide](https://pixijs.download/release/docs/core-concepts-8.html.md): setup for TypeScript 5, 6, and 7.
