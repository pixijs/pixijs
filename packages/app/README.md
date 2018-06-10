# @pixi/app

## Installation

```bash
npm install @pixi/app
```

## Usage

```js
import { Application } from '@pixi/app';

const app = new Application();
document.body.appendChild(app.view);
```

### Plugins

PixiJS provides a few plugins to add features to the Application. These can be installed from the following packages. Use `Application.registerPlugin` to use these plugins. _Note: if you are using pixi.js or pixi.js-legacy bundles, this is unnecessary since plugins are installed automatically by default._

* **LoaderPlugin** from `@pixi/loaders`
* **TickerPlugin** from `@pixi/ticker`