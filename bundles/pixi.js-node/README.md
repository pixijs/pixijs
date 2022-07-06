# @pixi/node

**We are now a part of the [Open Collective](https://opencollective.com/pixijs) and with your support you can help us make PixiJS even better. To make a donation, simply click the button below and we'll love you forever!**

<div align="center">
  <a href="https://opencollective.com/pixijs/donate" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=250 />
  </a>
</div>

## Setup

### Install

```
npm install @pixi/node
```

There is no default export. The correct way to import PixiJS is:

```js
import * as PIXI from "@pixi/node";
```

### Error installing canvas package

The [canvas](https://www.npmjs.com/package/canvas) library currently being used does not have a pre-built version for every environment.
When the package detects an unsupported environment, it will try to build from source.

To build from source you will need to make sure you have the following dependencies installed and then reinstall:

`brew install pkg-config cairo pango libpng jpeg giflib librsvg`

## Basic Usage Example
This example uses `express`, however, you can use any framework you like.

```js
import express from 'express';
import { Application, Sprite, Assets } from '@pixi/node';

const app = express();
const port = 3000;

app.use(express.static(__dirname))
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// This package requires the new asset loader to be used.
// Initialize the new assets loader
await PIXI.Assets.init({
    basePath: 'http://localhost:3000/'
});

// The application will create a renderer using WebGL. It will also setup the ticker
// and the root stage PIXI.Container.
const app = new PIXI.Application();

// load a sprite
const bunnyTexture = await PIXI.Assets.load('assets/bunny.png');
// create sprite from texture
const bunny = PIXI.Sprite.from(bunnyTexture);

// Setup the position of the bunny
bunny.x = app.renderer.width / 2;
bunny.y = app.renderer.height / 2;

// Rotate around the center
bunny.anchor.x = 0.5;
bunny.anchor.y = 0.5;

// Add the bunny to the scene we are building.
app.stage.addChild(bunny);

// Listen for frame updates
app.ticker.add(() => {
        // each frame we spin the bunny around a bit
    bunny.rotation += 0.01;
});

// extract and save the stage
app.renderer.render(stage);
const base64Image = app.renderer.plugins.extract
    .canvas(stage)
    .toDataURL('image/png');

const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
const output = `./test.png`;

writeFileSync(output, base64Data, 'base64');
```

### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
