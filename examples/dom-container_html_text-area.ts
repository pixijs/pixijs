// description: This example demonstrates how to integrate a DOM element into a PixiJS application using DOMContainer
import { Application, DOMContainer } from 'pixi.js';

(async () => {
  const app = new Application();

  await app.init({ backgroundColor: 0x1099bb, resizeTo: window });
  document.body.appendChild(app.canvas);
  document.body.style = 'margin: 0; overflow: hidden';

  // Create a DOM element
  const element = document.createElement('textarea');

  element.value = 'Type here...';

  // Create a DOM container
  const domContainer = new DOMContainer({
    element,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    anchor: 0.5,
  });

  // Add it to your scene
  app.stage.addChild(domContainer);

  app.ticker.add(() => {
    // Rotate the DOM container
    domContainer.rotation += 0.01;
  });
})();
