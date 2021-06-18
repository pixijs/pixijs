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

Renderer.registerSystem('events', EventSystem);

const app = new Application();

document.body.appendChild(app.view);

// Add a click listener!
stage.addEventListener('click', function handleClick()
{
    console.log('Hello world!');
});

// Render stage so that it becomes the root target for UI events
app.renderer.render(stage);

// Dispatch a synthetic event on the canvas to test it.
app.renderer.view.dispatchEvent(new PointerEvent('click', {
    pointerType: 'mouse',
    clientX: 1,
    clientY: 1,
    isPrimary: true,
}));
```
