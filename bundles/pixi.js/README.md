PixiJS — The HTML5 Creation Engine
=============

![pixi.js logo](https://pixijs.download/pixijs-banner-no-version.png)

The aim of this project is to provide a fast lightweight 2D library that works
across all devices. The PixiJS renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of WebGL. Also, it's fast. Really fast.

**Your support helps us make PixiJS even better. Make your pledge on [Patreon](https://www.patreon.com/user?u=2384552&ty=h&u=2384552) and we'll love you forever!**

### Setup

PixiJS can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) to integration with [Webpack](https://webpack.js.org/), [Browserify](http://browserify.org/), [Rollup](https://rollupjs.org/), [Electron](https://electron.atom.io/), [NW.js](https://nwjs.io/) or other module backed environments.

#### Install

```
npm install pixi.js
```
There is no default export. The correct way to import PixiJS is:

```js
import * as PIXI from 'pixi.js'
```
### Basic Usage Example

```js
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container.
const app = new PIXI.Application();

// The application will create a canvas element for you that you
// can then insert into the DOM.
document.body.appendChild(app.view);

// load the texture we need
app.loader.add('bunny', 'bunny.png').load((loader, resources) => {

    // This creates a texture from a 'bunny.png' image.
    const bunny = new PIXI.Sprite(resources.bunny.texture);

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
});
```

### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.

[![Analytics](https://ga-beacon.appspot.com/UA-39213431-2/pixi.js/index)](https://github.com/igrigorik/ga-beacon)
