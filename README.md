PixiJS — The HTML5 Creation Engine
=============

![pixi.js logo](https://pixijs.download/pixijs-banner-no-version.png?v=1)

[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/QrnxmQUPGV)
[![npm version](https://badge.fury.io/js/pixi.js.svg)](https://badge.fury.io/js/pixi.js)
[![Node.js CI](https://github.com/pixijs/pixijs/workflows/Node.js%20CI/badge.svg)](https://github.com/pixijs/pixijs/actions?query=workflow%3A%22Node.js+CI%22)
[![Financial Contributors](https://opencollective.com/pixijs/tiers/badge.svg)](https://opencollective.com/pixijs/donate)

This project aims to provide a fast, lightweight 2D library that works
across all devices. The PixiJS renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of WebGL. Also, it's fast. Really fast.

If you want to keep up to date with the latest PixiJS news then feel free to follow us on Twitter [@PixiJS](https://twitter.com/PixiJS)
and we will keep you posted! You can also check back on [our site](https://pixijs.com)
as any breakthroughs will be posted up there too!

**We are now a part of the [Open Collective](https://opencollective.com/pixijs) and with your support you can help us make PixiJS even better. To make a donation, simply click the button below and we'll love you forever!**

<div align="center">
  <a href="https://opencollective.com/pixijs/donate" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=250 />
  </a>
</div>

### What to Use PixiJS for and When to Use It

PixiJS is a rendering library that will allow you to create rich, interactive graphics and cross-platform applications and games without having to dive into the WebGL API or deal with browser and device compatibility.

PixiJS supports [WebGPU](https://en.wikipedia.org/wiki/WebGPU) with fallback support for [WebGL](https://en.wikipedia.org/wiki/WebGL). As a library, PixiJS is a fantastic tool for authoring interactive content. Use it for your graphics-rich, interactive websites, applications, and HTML5 games. Out-of-the-box, cross-platform compatibility and graceful degradation mean you have less work to do and more fun doing it! If you want to create polished and refined experiences relatively quickly without delving into dense, low-level code, all while avoiding the headaches of browser inconsistencies, then sprinkle your next project with some PixiJS magic!

**Boost your development and feel free to use your imagination!**

### Current features ###

- WebGL renderer (with automatic smart batching, allowing for REALLY fast performance)
- WebGPU renderer (new to the latest browsers!)
- Canvas renderer (Fastest in town!)
- Full scene graph
- Super easy to use API (similar to the flash display list API)
- Support for texture atlases
- Asset loader / sprite sheet loader
- Auto-detect which renderer should be used
- Full Mouse and Multi-touch Interaction
- Text
- BitmapFont text
- Multiline Text
- Render Texture
- Primitive Drawing
- Masking
- Filters
- Community-Supported Plugins
  - [React](https://github.com/pixijs/pixi-react)
  - [Spine](https://github.com/pixijs/spine)
  - [Filters](https://github.com/pixijs/filters)
  - [Animate](https://github.com/pixijs/animate)
  - [Lights](https://github.com/pixijs/lights)
  - [UI](https://github.com/pixijs/ui)
  - [Layout](https://github.com/pixijs/layout)
  - [GIF](https://github.com/pixijs/gif)
  - And more!

### Setup ###

It's easy to get started with PixiJS! Simply download a [prebuilt build](https://github.com/pixijs/pixijs/wiki/FAQs#where-can-i-get-a-build)!

Alternatively, PixiJS can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or simply using a content delivery network (CDN) URL to embed PixiJS directly on your HTML page.

#### NPM Install

```sh
npm install pixi.js
```

There is no default export. The correct way to import PixiJS is:

```js
import * as PIXI from 'pixi.js';
```

#### CDN Install

Via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/pixi.min.js"></script>
```

Or via unpkg:

```html
<script src="https://unpkg.com/pixi.js@7.x/dist/pixi.min.js"></script>
```

### Basic Usage Example ###

```js
import { Application, Sprite, Assets } from 'pixi.js';

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application();

// Wait for the Renderer to be available
await app.init();

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.canvas);

// load the texture we need
const texture = await Assets.load('bunny.png');

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
```

### Learn ###
- Website: Find out more about PixiJS on the [official website](https://pixijs.com).
- Getting Started:
    - Check out the [getting started guide](https://pixijs.com/guides/basics/getting-started).
    - Also, check out @miltoncandelero's PixiJS tutorials aimed toward videogames with recipes and best practices [here](https://www.pixijselementals.com)
- Examples: Get stuck right in and play around with PixiJS code and features right [here](https://pixijs.com/examples)!
- API Documentation: Get to know the PixiJS API by checking out the [docs](https://pixijs.io/docs).
- Guide: Supplementary usage guides to the API Documentation [here](https://pixijs.com/guides).

### Demos ###

- [Filters Demo](https://pixijs.io/filters/examples)
- [Bunny Demo](http://www.goodboydigital.com/pixijs/bunnymark)
- [Masking Demo](https://pixijs.com/examples/masks/graphics)
- [Interaction Demo](https://pixijs.com/examples/events/interactivity)
- [More examples](https://pixijs.com/examples)

### Community ###

- Forums: Check out the [discussions](https://github.com/pixijs/pixijs/discussions) and [Stackoverflow](http://stackoverflow.com/search?q=pixi.js) -- both friendly places to ask your PixiJS questions.
- Chat: You can join us on [Discord](https://discord.gg/QrnxmQUPGV) to chat about PixiJS.

### How to build ###

Note that for most users you don't need to build this project. If all you want is to use PixiJS, then
just download one of our [prebuilt releases](https://github.com/pixijs/pixijs/releases).
The only time you should need to build PixiJS is if you are developing it.

If you don't already have Node.js and NPM, go install them. Then, in the folder where you have cloned
the repository, install the build dependencies using npm:

```sh
npm install
```

Then, to build the source, run:

```sh
npm run build
```

### How to generate the documentation ###

The docs can be generated using npm:

```sh
npm run docs
```

### Contribute ###

Want to be part of the PixiJS project? Great! All are welcome! We will get there quicker
together :) Whether you find a bug, have a great feature request, or you fancy owning a task
from the road map above, feel free to get in touch.

Make sure to read the [Contributing Guide](.github/CONTRIBUTING.md)
before submitting changes.

### License ###

This content is released under the [MIT License](http://opensource.org/licenses/MIT).
