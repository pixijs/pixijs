# @pixi/graphics-extras

Adds the follow methods to Graphics:

* `drawTorus`
* `drawChamferRect`
* `drawFilletRect`
* `drawRegularPolygon`

## Installation

```bash
npm install @pixi/graphics-extras
```

## Usage

```js
import { Graphics } from '@pixi/graphics';
import '@pixi/graphics-extras';

const shapes = new Graphics()
    .beginFill(0xffffff)
    .drawTorus(0, 0, 20, 100);
```
