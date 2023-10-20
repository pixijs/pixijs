@pixi/webworker
=============

![PixiJS logo](https://files.pixijs.download/branding/pixijs-banner.png)

The aim of this project is to provide a fast lightweight 2D library that works
across all devices. The PixiJS renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of WebGL. Also, it's fast. Really fast.

**We are now a part of the [Open Collective](https://opencollective.com/pixijs) and with your support you can help us make PixiJS even better. To make a donation, simply click the button below and we'll love you forever!**

<div align="center">
  <a href="https://opencollective.com/pixijs/donate" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=250 />
  </a>
</div>

### Setup

PixiJS can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) to integrate with [Webpack](https://webpack.js.org/), [Browserify](http://browserify.org/), [Rollup](https://rollupjs.org/), [Electron](https://electron.atom.io/), [NW.js](https://nwjs.io/) or other module backed environments.

#### Install

```
npm install @pixi/webworker
```

There is no default export. The correct way to import PixiJS is:

```js
import * as PIXI from '@pixi/webworker';
```

#### CDN Install

Via jsDelivr:

```js
importScripts('https://cdn.jsdelivr.net/npm/pixi.js-webworker@7.x/dist/pixi-webworker.min.js');
```

Or via unpkg:

```js
importScripts('https://unpkg.com/pixi.js-webworker@7.x/dist/pixi-webworker.min.js');
```

### Basic Usage Example

In `index.js`:
```js
// Create a canvas element and insert it into DOM
const width = 800, height = 600;
const resolution = window.devicePixelRatio;
const canvas = document.createElement('canvas');
canvas.style.width = `${ width }px`;
canvas.style.height = `${ height }px`;
document.body.appendChild(canvas);

// Create the worker
const worker = new Worker('worker.js', { type: 'module' });
// Transfer canvas to the worker
const view = canvas.transferControlToOffscreen();
worker.postMessage({ width, height, resolution, view }, [view]);

```

In `worker.js`:
```js
import { Application, Assets, Sprite } from '@pixi/webworker';

self.onmessage = async e => {
    // Recieve OffscreenCanvas from index.js
    const { width, height, resolution, view } = e.data;
    
    // The application will create a renderer using WebGL, if possible,
    // with a fallback to a canvas render. It will also setup the ticker
    // and the root stage PIXI.Container
    const app = new Application({ width, height, resolution, view });

    // load the texture we need
    const texture = await Assets.load('assets/bunny.png');

    // This creates a texture from a 'bunny.png' image
    const bunny = new Sprite(texture);

    // Setup the position of the bunny
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    // Rotate around the center
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Add the bunny to the scene we are building
    app.stage.addChild(bunny);

    // Listen for frame updates
    app.ticker.add(() => {
        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;
    });
}
```

### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
