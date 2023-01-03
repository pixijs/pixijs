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

### Error installing gl package

In most cases installing `gl` from npm should just work. However, if you run into problems you might need to adjust your system configuration and make sure all your dependencies are up to date

Please refer to the [gl installation guide](https://www.npmjs.com/package/gl/v/4.5.3-win64.0#system-dependencies) for more information.

### Error installing canvas package

The [canvas](https://www.npmjs.com/package/canvas) library currently being used does not have a pre-built version for every environment.
When the package detects an unsupported environment, it will try to build from source.

To build from source you will need to make sure you have the following dependencies installed and then reinstall:

`brew install pkg-config cairo pango libpng jpeg giflib librsvg`

For non-mac users, please refer to the [canvas installation guide](https://www.npmjs.com/package/canvas#compiling) for more information.

### Error unable to auto-detect a suitable renderer
When running in a headless environment (e.g. server or continuous integration), use `xvfb` as a virtual frame buffer.
Install with:
```
sudo apt-get install xvfb
```
And then use with node when starting the program:
```
xvfb-run node ./src/index.js
```

## Basic Usage Example

```js
import { Application, Assets, Sprite } from '@pixi/node';
import path from 'path';
import { writeFileSync } from 'fs';

// This package requires the new asset loader to be used.
// Initialize the new assets loader
await Assets.init();

// The application will create a renderer using WebGL. It will also setup the ticker
// and the root stage Container.
const app = new Application();

// load a sprite
const bunnyTexture = await Assets.load(path.join(process.cwd(), 'assets/bunny.png'));
// create sprite from texture
const bunny = Sprite.from(bunnyTexture);

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
app.renderer.render(app.stage);
const base64Image = app.renderer.extract
    .canvas(app.stage)
    .toDataURL('image/png');

const base64Data = base64Image.replace(/^data:image\/png;base64,/, '');
const output = `./test.png`;

writeFileSync(output, base64Data, 'base64');
```

## Full environment setup with Docker 🐳

*NOTE: It is recommended to add `node_modules` to your `.dockerignore` file.*

```Dockerfile
# Set the base image
FROM node:16

# Create and set the working directory
WORKDIR /usr/src/app

# Add dependencies for gl, canvas and xvfb
# Important! These dependencies must be installed before running `npm install`
RUN apt-get update \
    && apt-get install -y build-essential libcairo2-dev libgif-dev libglew-dev libglu1-mesa-dev libjpeg-dev libpango1.0-dev librsvg2-dev libxi-dev pkg-config xvfb \
    && rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Start the server
EXPOSE 3000
CMD xvfb-run node ./src/index.js
```

### License

This content is released under the (http://opensource.org/licenses/MIT) MIT License.
