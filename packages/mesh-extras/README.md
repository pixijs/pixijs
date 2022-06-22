# @pixi/mesh-extras

## Installation

```bash
npm install @pixi/mesh-extras
```

## Usage

```js
import { MeshRenderer } from '@pixi/mesh';
import { extensions } from '@pixi/core';
import { Rope } from '@pixi/mesh-extras';

extensions.add('mesh', MeshRenderer);

const rope = new Rope();
```