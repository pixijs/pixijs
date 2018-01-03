PixiJS — The HTML5 Creation Engine
=============

![pixi.js logo](http://www.goodboydigital.com/pixijs/pixiV4_wide_full.jpg)

[![Inline docs](http://inch-ci.org/github/pixijs/pixi.js.svg?branch=dev)](http://inch-ci.org/github/pixijs/pixi.js)
[![Build Status](https://travis-ci.org/pixijs/pixi.js.svg?branch=dev)](https://travis-ci.org/pixijs/pixi.js)

The aim of this project is to provide a fast lightweight 2D library that works
across all devices. The PixiJS renderer allows everyone to enjoy the power of
hardware acceleration without prior knowledge of WebGL. Also, it's fast. Really fast.

If you want to keep up to date with the latest PixiJS news then feel free to follow us on twitter
([@doormat23](https://twitter.com/doormat23), [@rolnaaba](https://twitter.com/rolnaaba), [@bigtimebuddy](https://twitter.com/bigtimebuddy), [@ivanpopelyshev](https://twitter.com/ivanpopelyshev))
and we will keep you posted! You can also check back on [our site](http://www.pixijs.com)
as any breakthroughs will be posted up there too!

**Your support helps us make PixiJS even better. Make your pledge on [Patreon](https://www.patreon.com/user?u=2384552&ty=h&u=2384552) and we'll love you forever!**

### What to Use PixiJS for and When to Use It

PixiJS is a rendering library that will allow you to create rich, interactive graphics, cross platform applications, and games without having to dive into the WebGL API or deal with browser and device compatibility.

PixiJS has full [WebGL](https://en.wikipedia.org/wiki/WebGL) support and seamlessly falls back to HTML5's [canvas](https://en.wikipedia.org/wiki/Canvas_element) if needed. As a framework, PixiJS is a fantastic tool for authoring interactive content, *especially with the move away from Adobe Flash in recent years*. Use it for your graphics rich, interactive websites, applications, and HTML5 games.  Out of the box cross-platform compatibility and graceful degradation mean you have less work to do and have more fun doing it! If you want to create polished and refined experiences relatively quickly, without delving into dense, low level code, all while avoiding the headaches of browser inconsistencies, then sprinkle your next project with some PixiJS magic!

**Boost your development and feel free to use your imagination!**

### Learn ###
- Website: Find out more about PixiJS on the [offical website](http://www.pixijs.com/).
- Getting started: Check out @kittykatattack's comprehensive [tutorial](https://github.com/kittykatattack/learningPixi).
- Examples: Get stuck right in and play around with PixiJS code and features right [here](http://pixijs.github.io/examples/)!
- Docs: Get to know the PixiJS API by checking out the [docs](https://pixijs.github.io/docs/).
- Wiki: Other misc tutorials and resources are [on the Wiki](https://github.com/pixijs/pixi.js/wiki).

### Community ###
- Forums: Check out the [forum](http://www.html5gamedevs.com/forum/15-pixijs/) and [Stackoverflow](http://stackoverflow.com/search?q=pixi.js), both friendly places to ask your pixi questions.
- Inspiration: Check out the [gallery](http://www.pixijs.com/gallery) to see some of the amazing things people have created!
- Chat: You can join us on [Gitter](https://gitter.im/pixijs/pixi.js) To chat about PixiJS. We also now have a Slack channel. If you would like to join it please Send me an email (mat@goodboydigital.com) and I will invite you in.


### Setup ###

It's easy to get started with PixiJS! Simply download a [prebuilt build](https://github.com/pixijs/pixi.js/wiki/FAQs#where-can-i-get-a-build)!

Alternatively, PixiJS can be installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or simply using a content delivery network (CDN) URL to embed PixiJS directly on your HTML page.

_Note: After v4.5.0, support for the [Bower](https://bower.io) package manager has been dropped. Please see the [release notes](https://github.com/pixijs/pixi.js/releases/tag/v4.5.0) for more information._

#### NPM Install

```sh
$> npm install pixi.js
```

#### CDN Install (via cdnjs)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.5.1/pixi.min.js"></script>
```

_Note: `4.5.1` can be replaced by any [released](https://github.com/pixijs/pixi.js/releases) version._

### Demos ###

- [WebGL Filters!](http://pixijs.github.io/pixi-filters/examples/)
- [Run pixie run](http://www.goodboydigital.com/runpixierun)
- [Fight for Everyone](http://www.goodboydigital.com/casestudies/fightforeveryone)
- [Flash vs HTML](http://flashvhtml.com)
- [Bunny Demo](http://www.goodboydigital.com/pixijs/bunnymark)
- [Storm Brewing](http://www.goodboydigital.com/pixijs/storm)
- [Filters Demo](http://www.goodboydigital.com/pixijs/examples/15/indexAll.html)
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

Make sure to read the [Contributing Guide](https://github.com/pixijs/pixi.js/blob/master/CONTRIBUTING.md)
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
- [User Plugins](https://github.com/pixijs/pixi.js/wiki/v3-Pixi-Plugins)

### Basic Usage Example ###

```js
// The application will create a renderer using WebGL, if possible,
// with a fallback to a canvas render. It will also setup the ticker
// and the root stage PIXI.Container
const app = new PIXI.Application();

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

// load the texture we need
PIXI.loader.add('bunny', 'bunny.png').load((loader, resources) => {
    // This creates a texture from a 'bunny.png' image
    const bunny = new PIXI.Sprite(resources.bunny.texture);

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
});
```

### How to build ###

Note that for most users you don't need to build this project. If all you want is to use PixiJS, then
just download one of our [prebuilt releases](https://github.com/pixijs/pixi.js/releases). Really
the only time you should need to build PixiJS is if you are developing it.

If you don't already have Node.js and NPM, go install them. Then, in the folder where you have cloned
the repository, install the build dependencies using npm:

```sh
$> npm install
```

Then, to build the source, run:

```sh
$> npm run dist
```

This will create a minified version at `dist/pixi.min.js` and a non-minified version at `dist/pixi.js`
with all the plugins in the PixiJS project.

If there are specific plugins you don't want, say "interaction" or "extras", you can exclude those:

```sh
$> npm run dist -- --exclude extras --exclude interaction
```

You can also use the short-form `-e`:

```sh
$> npm run dist -- -e extras -e interaction -e filters
```

### How to generate the documentation ###

The docs can be generated using npm:

```sh
$> npm run docs
```

The documentation uses [Jaguar.js](https://github.com/pixijs/jaguarjs-jsdoc) and the jsdoc format, the configuration file can be found at [scripts/jsdoc.conf.json](scripts/jsdoc.conf.json)

### License ###

This content is released under the (http://opensource.org/licenses/MIT) MIT License.

[![Analytics](https://ga-beacon.appspot.com/UA-39213431-2/pixi.js/index)](https://github.com/igrigorik/ga-beacon)
