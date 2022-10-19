PixiJS — The HTML5 Creation Engine
=============

![pixi.js logo](https://pixijs.download/pixijs-banner-no-version.png)

[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/QrnxmQUPGV)
[![npm version](https://badge.fury.io/js/pixi.js.svg)](https://badge.fury.io/js/pixi.js)
[![Node.js CI](https://github.com/pixijs/pixijs/workflows/Node.js%20CI/badge.svg)](https://github.com/pixijs/pixijs/actions?query=workflow%3A%22Node.js+CI%22)

This project aims to provide a fast lightweight 2D library that works
across all devices. The PixiJS renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of WebGL. Also, it's fast. Really fast.

If you want to keep up to date with the latest PixiJS news then feel free to follow us on Twitter [@PixiJS](https://twitter.com/PixiJS)
and we will keep you posted! You can also check back on [our site](https://www.pixijs.com)
as any breakthroughs will be posted up there too!

**We are now a part of the [Open Collective](https://opencollective.com/pixijs) and with your support you can help us make PixiJS even better. To make a donation, simply click the button below and we'll love you forever!**

<div align="center">
  <a href="https://opencollective.com/pixijs/donate" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=250 />
  </a>
</div>

### What to Use PixiJS for and When to Use It

PixiJS is a rendering library that will allow you to create rich, interactive graphics, cross-platform applications, and games without having to dive into the WebGL API or deal with browser and device compatibility.

PixiJS has full [WebGL](https://en.wikipedia.org/wiki/WebGL) support and seamlessly falls back to HTML5's [canvas](https://en.wikipedia.org/wiki/Canvas_element) if needed. As a framework, PixiJS is a fantastic tool for authoring interactive content, *especially with the move away from Adobe Flash in recent years*. Use it for your graphics-rich, interactive websites, applications, and HTML5 games.  Out of the box, cross-platform compatibility and graceful degradation mean you have less work to do and have more fun doing it! If you want to create polished and refined experiences relatively quickly, without delving into dense, low-level code, all while avoiding the headaches of browser inconsistencies, then sprinkle your next project with some PixiJS magic!

**Boost your development and feel free to use your imagination!**

### Learn ###
- Website: Find out more about PixiJS on the [official website](https://www.pixijs.com/).
- Getting started:
    - Check out @kittykatattack's comprehensive [tutorial](https://github.com/kittykatattack/learningPixi).
    - Also check out @miltoncandelero's PixiJS tutorials aimed toward videogames with recipes, best practices and TypeScript / npm / webpack setup [here](https://www.pixijselementals.com/)
- Examples: Get stuck right in and play around with PixiJS code and features right [here](https://pixijs.io/examples/)!
- Docs: Get to know the PixiJS API by checking out the [docs](https://pixijs.io/docs/).
- Guide: Supplementary guide to the API documentation [here](https://pixijs.io/guides/).
- Wiki: Other misc tutorials and resources are [on the Wiki](https://github.com/pixijs/pixijs/wiki).

### Community ###
- Forums: Check out the [forum](https://www.html5gamedevs.com/forum/15-pixijs/) and [Stackoverflow](http://stackoverflow.com/search?q=pixi.js), both friendly places to ask your PixiJS questions.
- Inspiration: Check out the [gallery](https://www.pixijs.com/gallery) to see some of the amazing things people have created!
- Chat: You can join us on [Discord](https://discord.gg/QrnxmQUPGV) to chat about PixiJS.

### Setup ###

It's easy to get started with PixiJS! Simply download a [prebuilt build](https://github.com/pixijs/pixi.js/wiki/FAQs#where-can-i-get-a-build)!

Alternatively, PixiJS can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or simply using a content delivery network (CDN) URL to embed PixiJS directly on your HTML page.

_Note: After v4.5.0, support for the [Bower](https://bower.io) package manager has been dropped. Please see the [release notes](https://github.com/pixijs/pixi.js/releases/tag/v4.5.0) for more information._

#### NPM Install

```sh
npm install pixi.js
```

There is no default export. The correct way to import PixiJS is:

```js
import * as PIXI from 'pixi.js'
```

#### CDN Install

Via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/pixi.js@7.x/dist/browser/pixi.min.js"></script>
```

Or via unpkg:

```html
<script src="https://unpkg.com/pixi.js@7.x/dist/browser/pixi.min.js"></script>
```

### Demos ###

- [Filters Demo](https://pixijs.io/filters/tools/demo/)
- [Run Pixie Run](http://work.goodboydigital.com/runpixierun/)
- [Flash vs HTML](http://flashvhtml.com)
- [Bunny Demo](http://www.goodboydigital.com/pixijs/bunnymark)
- [Storm Brewing](http://www.goodboydigital.com/pixijs/storm)
- [Render Texture Demo](http://www.goodboydigital.com/pixijs/examples/11)
- [Primitives Demo](http://www.goodboydigital.com/pixijs/examples/13)
- [Masking Demo](http://www.goodboydigital.com/pixijs/examples/14)
- [Interaction Demo](http://www.goodboydigital.com/pixijs/examples/6)
- [photonstorm's Balls Demo](http://gametest.mobi/pixi/balls)
- [photonstorm's Morph Demo](http://gametest.mobi/pixi/morph)

Thanks to [@photonstorm](https://twitter.com/photonstorm) for providing
those last 2 examples and allowing us to share the source code :)

### Contribute ###

Want to be part of the PixiJS project? Great! All are welcome! We will get there quicker
together :) Whether you find a bug, have a great feature request or you fancy owning a task
from the road map above feel free to get in touch.

Make sure to read the [Contributing Guide](.github/CONTRIBUTING.md)
before submitting changes.

### Current features ###

- WebGL renderer (with automatic smart batching allowing for REALLY fast performance)
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
- [User Plugins](https://github.com/pixijs/pixijs/wiki/v6-Resources)

### Basic Usage Example ###

```js
import { Application, Sprite, Assets } from 'pixi.js';

// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new Application();

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

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

#### Error installing gl package

In most cases installing `gl` from npm should just work. However, if you run into problems you might need to adjust your system configuration and make sure all your dependencies are up to date

Please refer to the [gl installation guide](https://www.npmjs.com/package/gl/v/4.5.3-win64.0#system-dependencies) for more information.

#### Error installing canvas package

The [canvas](https://www.npmjs.com/package/canvas) library currently being used does not have a pre-built version for every environment.
When the package detects an unsupported environment, it will try to build from source.

To build from source you will need to make sure you have the following dependencies installed and then reinstall:

`brew install pkg-config cairo pango libpng jpeg giflib librsvg`

For non-mac users, please refer to the [canvas installation guide](https://www.npmjs.com/package/canvas#compiling) for more information.

### How to generate the documentation ###

The docs can be generated using npm:

```sh
npm run docs
```

The documentation uses [webdoc](https://github.com/webdoc-labs/webdoc) in combination with this template [pixi-webdoc-template](https://github.com/pixijs/pixi-webdoc-template). The configuration file can be found at [webdoc.conf.json](webdoc.conf.json)

### License ###

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
