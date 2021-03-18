#  @pixi/events

This packages implements the Federated Events API, the plumbing behind the propagation of UI events into the PixiJS
scene graph.

## Installation

```bash
npm install @pixi/events
```

## Usage

```ts
import { Application, Renderer } from '@pixi/core';
import { EventSystem } from '@pixi/events';

// If you are using the pixi.js/pixi.js-legacy bundles, you'll need to remove the interaction
// plugin. This is not needed when using the scoped (@pixi/) packages directly.
delete Renderer.__plugins.interaction;

const app = new PIXI.Application();
const { renderer} = app;

document.body.appendChild(app.view);

// Install the EventSystem
renderer.addSystem(EventSystem, 'events');

// Add a click listener!
stage.addEventListener('click', function handleClick()
{
    console.log('Hello world!');
});

// Render stage so that it becomes the root target for UI events
renderer.render(stage);

// Dispatch a synthetic event on the canvas to test it.
renderer.view.dispatchEvent(new PointerEvent('click', {
    pointerType: 'mouse',
    clientX: 1,
    clientY: 1,
    isPrimary: true,
}));
```