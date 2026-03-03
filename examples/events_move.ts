// description: This example demonstrates moving a sprite to follow the pointer position
import { Application, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create the circle
  const circle = app.stage.addChild(
    new Graphics().circle(0, 0, 8).fill({ color: 0xffffff }).stroke({ color: 0x111111, alpha: 0.87, width: 1 }),
  );

  circle.position.set(app.screen.width / 2, app.screen.height / 2);

  // Enable interactivity!
  app.stage.eventMode = 'static';

  // Make sure the whole canvas area is interactive, not just the circle.
  app.stage.hitArea = app.screen;

  // Follow the pointer
  app.stage.addEventListener('pointermove', (e) => {
    circle.position.copyFrom(e.global);
  });
})();
