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

## CDN Install

Via jsDelivr:

```html
<!-- This script tag should be placed after pixi.min.js -->
<script src="https://cdn.jsdelivr.net/npm/@pixi/graphics-extras@7.x/dist/graphics-extras.min.js"></script>
```

Or via unpkg:

```html
<!-- This script tag should be placed after pixi.min.js -->
<script src="https://unpkg.com/@pixi/graphics-extras@7.x/dist/graphics-extras.min.js"></script>
```
