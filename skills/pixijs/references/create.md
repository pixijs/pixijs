# create

Scaffolding a PixiJS v8 project with `create pixi.js`, adding `pixi.js` to an existing project, and the TypeScript and Vite settings it needs.

## Scaffolding

```bash
npm create pixi.js@latest my-game -- --template bundler-vite
cd my-game
npm install
npm run dev
```

- With no arguments the CLI prompts for project name (default `pixi-project`), template category and variant (TypeScript or JavaScript). It never installs dependencies; it prints the `cd` + install + dev commands for the manager you ran it with.
- npm 7+ needs the `--` before CLI flags; without it npm consumes `--template` and the CLI falls back to the interactive prompt. `yarn create pixi.js`, `pnpm create pixi.js` and `bun create pixi.js` take the flags directly.
- `.` as the project name scaffolds into the current directory; the CLI refuses to overwrite conflicting files in a non-empty directory unless you confirm the prompt.
- Requires Node.js 18+ or 20+; `creation-web` and `framework-react` may need a newer Node, and the package manager warns ("engines") if so.
- In an existing project skip the CLI: `npm install pixi.js`. The templates add nothing to the library.

| Template | What you get |
| --- | --- |
| `bundler-vite` | Vite + TypeScript. The recommended default. |
| `bundler-vite-js` | Vite + JavaScript. |
| `bundler-webpack` / `bundler-webpack-js` | Webpack + TypeScript / JavaScript. |
| `bundler-esbuild` / `bundler-esbuild-js` | esbuild + TypeScript / JavaScript. |
| `bundler-import-map` | No bundler; a browser import map. |
| `creation-web` | Creation Engine web template: scene-based game scaffolding, AssetPack, sound and UI. |
| `framework-react` / `framework-react-js` | React + PixiJS via `@pixi/react`, TypeScript / JavaScript. |
| `extension-default` | Starter for a reusable PixiJS extension package. |

Run the CLI without arguments to see the current menu. In `bundler-vite`, `npm run build` runs `npm run lint && tsc && vite build` into `dist/`, so a lint or type error fails the build; it has no `preview` script (use `npx vite preview`). Other presets name their scripts differently; check `package.json`.

## Top-level `await app.init()` in Vite production builds

On Vite 6 and earlier, top-level `await` works in dev but `vite build` fails with "Top-level await is not available in the configured target environment", because the default build target is es2020. Wrap the init in an async IIFE, which works on every version:

```ts
import { Application } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);
})();
```

Vite 7+ builds top-level `await` as is, and on older Vite `build: { target: "es2022" }` (or later) also fixes it.

## TypeScript setup

PixiJS's type declarations depend on the WebGPU types; where they come from depends on the TypeScript version.

- **TypeScript 5:** no WebGPU types are built in, so PixiJS adds `@webgpu/types` for you. No setup needed.
- **TypeScript 6 and 7:** the WebGPU types are in the built-in `"dom"` library, but up to TypeScript 6.0.3 and 7.0.2 it lacks the WebGPU flag constants (`GPUBufferUsage`, `GPUColorWrite`, `GPUMapMode`, `GPUShaderStage`, `GPUTextureUsage`), so raw WebGPU code using them fails with `Cannot find name 'GPUTextureUsage'` (`TS2552`). Install `@types/web` 0.0.352 or later, drop `"dom"` from `lib`, and add `"@types/web"` to `types` alongside any existing entries:

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

On TypeScript 6 and 7, remove `"@webgpu/types"` from `types` (keep any other entries): it declares the built-in WebGPU types a second time, which with `skipLibCheck: false` produces dozens of conflicting-declaration errors inside `lib.dom.d.ts` and `@webgpu/types`. Adding it back for the flag constants only compiles with `skipLibCheck: true`.

Use `"moduleResolution": "bundler"` with a bundler (with `"module": "esnext"`), or `"nodenext"` otherwise. `"node"` (also called `"node10"`) ignores the `exports` field in PixiJS's `package.json`, so `import 'pixi.js/advanced-blend-modes'` and other subpath imports don't resolve; TypeScript 6 reports `TS2882` for them and deprecates the setting (`TS5107`), and TypeScript 7 removes it (`TS5108`).
