# @pixi/mesh-extras

## Installation

```bash
npm install @pixi/mesh-extras
```

## Usage

```js
import { MeshRenderer } from '@pixi/mesh';
import { Renderer } from '@pixi/core';
import { Rope } from '@pixi/mesh-extras';

Renderer.registerPlugin('mesh', MeshRenderer);

const rope = new Rope();
```