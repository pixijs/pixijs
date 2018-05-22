# @pixi/interaction

## Installation

```bash
npm install @pixi/interaction
```

## Usage

Simple usage as an Application plugin:

```js
import {InteractionPlugin} from '@pixi/interaction';
import {Application} from '@pixi/app';

Application.registerPlugin(InteractionPlugin);

const app = new Application();
app.interaction.on('click', () => {});
```

Advanced usage, instanciating the InteractionManager directly:

```js
import { InteractionManager } from '@pixi/interaction';
import { Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
import { Ticker } from '@pixi/ticker';

const renderer = new Renderer();
const stage = new Container();
const interaction = new InteractionManager({
  root: stage, 
  ticker: Ticker.shared,
  view: renderer.view,
  resolution: renderer.resolution
});
interaction.on('click', () => {});
```
