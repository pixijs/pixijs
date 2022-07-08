# @pixi/events

This packages implements the Federated Events API, the plumbing behind the propagation of UI events into the PixiJS
scene graph.

## Installation

```bash
npm install @pixi/events
```

## Usage

```js
import { EventSystem } from '@pixi/events';
import { extensions } from '@pixi/core';

extensions.add(EventSystem);
```
