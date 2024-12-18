<p align="center">
  <a href="https://pixijs.com" target="_blank" rel="noopener noreferrer">
    <img height="150" src="https://files.pixijs.download/branding/pixijs-logo-transparent-dark.svg?v=1" alt="PixiJS logo">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://npmjs.com/package/pixi.js"><img src="https://img.shields.io/npm/v/pixi.js.svg" alt="npm package"></a>
  <a href="https://github.com/pixijs/pixijs/actions/workflows/release.yml"><img src="https://github.com/pixijs/pixijs/actions/workflows/release.yml/badge.svg" alt="build status"></a>
  <a href="https://opencollective.com/pixijs/tiers/badge.svg"><img src="https://opencollective.com/pixijs/tiers/badge.svg" alt="Start new PR in StackBlitz Codeflow"></a>
  <a href="https://discord.gg/QrnxmQUPGV"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
</p>
<p align="center">
 <a href="https://pixijs.com/8.x/examples">Examples</a> | <a href="https://pixijs.com/8.x/guides">Getting Started</a> | <a href="https://pixijs.download/release/docs/index.html">Documentation</a>  | <a href="https://discord.gg/QrnxmQUPGV">Discord</a>
</p>

# PixiJS ⚡️
> Next-Generation, Fastest HTML5 Creation Engine for the Web

- 🚀 [WebGL](https://en.wikipedia.org/wiki/WebGL) & [WebGPU](https://en.wikipedia.org/wiki/WebGPU) Renderers
- ⚡️ Unmatched Performance & Speed
- 🎨 Easy to use, yet powerful API
- 📦 Asset Loader
- ✋ Full Mouse & Multi-touch Support
- ✍️ Flexible Text Rendering
- 📐 Versatile Primitive and SVG Drawing
- 🖼️ Dynamic Textures
- 🎭 Masking
- 🪄 Powerful Filters
- 🌈 Advanced Blend Modes

PixiJS is the fastest, most lightweight 2D library available for the web, working
across all devices and allowing you to create rich, interactive graphics and cross-platform applications using WebGL and WebGPU.

### Setup

It's easy to get started with PixiJS! Just use our [PixiJS Create](https://pixijs.io/create-pixi/) CLI and get set up in just one command:

<p align="center">
  <img width="500" style="border-radius: 10px; filter: drop-shadow(0px 2px 5px #000);;" alt="Screenshot from terminal" src="https://pixijs.io/create-pixi/img/demo.gif">
</p>

```
npm create pixi.js@latest
```
or to add it to an existing project:

```
npm install pixi.js
```

### Usage
```typescript
import { Application, Assets, Sprite } from 'pixi.js';

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the bunny texture
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) =>
    {
        // Just for fun, let's rotate mr rabbit a little.
        // * Delta is 1 if running at 100% performance *
        // * Creates frame-independent transformation *
        bunny.rotation += 0.1 * time.deltaTime;
    });
})();
```
### Contribute

Want to be part of the PixiJS project? Great! All are welcome! We will get there quicker
together :) Whether you find a bug, have a great feature request, or you fancy owning a task
from the road map above, feel free to get in touch.

Make sure to read the [Contributing Guide](.github/CONTRIBUTING.md)
before submitting changes.

### License

This content is released under the [MIT License](http://opensource.org/licenses/MIT).

### Change Log
[Releases](https://github.com/pixijs/pixijs/releases)

### Support
We're passionate about making PixiJS the best graphics library possible. Our dedication comes from our love for the project and community. If you'd like to support our efforts, please consider contributing to our open collective.
<div>
  <a href="https://opencollective.com/pixijs" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=200 />
  </a>
</div>
