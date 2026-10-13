---
sidebar_position: 8
title: TypeScript
description: Set up TypeScript 5, 6, or 7 for PixiJS.
category: core-concepts
---

# Using PixiJS with TypeScript

PixiJS supports WebGPU, so its type declarations depend on the WebGPU types. Where those come from depends on your TypeScript version.

## TypeScript 5

TypeScript 5 has no WebGPU types built in, so PixiJS adds [`@webgpu/types`](https://github.com/gpuweb/types) for you. No additional setup required.

## TypeScript 6 and 7

TypeScript 6 and 7 build the WebGPU types into the `"dom"` library, but some releases leave parts out, such as `GPUTextureUsage`. Use [`@types/web`](https://www.npmjs.com/package/@types/web), which has the full set, in place of `"dom"`. Remove `@webgpu/types` from `types` if it's there, since it conflicts with the built-in types.

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
