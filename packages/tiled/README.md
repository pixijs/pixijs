# @pixi/tiled

Plugins for `@pixi/loaders` to support loading the [TMX Map Format].

[TMX Map Format]: http://doc.mapeditor.org/en/latest/reference/tmx-map-format/

## Installation

```bash
npm install @pixi/tiled
```

## Usage

```js
import { TilesetLoader } from '@pixi/tiled';
import { Loader } from '@pixi/loaders';
Loader.registerPlugin(TilesetLoader);
```
