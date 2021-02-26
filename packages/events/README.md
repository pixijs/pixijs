#  @pixi/events

This packages implements the Federated Events API, the plumbing behind the propagation of UI events into the PixiJS
scene graph.

## Installation

```bash
npm install @pixi/events
```

## Usage

The `pixi.js` and `pixi.js-legacy` bundles add the `EventSystem` to renderers by default.

```ts
import { EventSystem } from '@pixi/events';

renderer.addSystem(EventSystem, 'events');
renderer.render(stage);// Render stage so that it becomes the root target for UI events

stage.addEventListener('click', function handleClick()
{
    console.log('Hello world!');
})

renderer.view.dispatchEvent(new PointerEvent('click', {
    pointerType: 'mouse',
    clientX: 1,
    clientY: 1,
    isPrimary: true,
}));
```