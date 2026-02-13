// description: This example demonstrates how to create an inverse mask using the Graphics class
import { Application, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const rect = new Graphics().rect(0, 0, 400, 400).fill('red');
  const masky = new Graphics().star(160, 160, 5, 100).fill('yellow');

  masky.width = 240;
  masky.height = 240;

  rect.setMask({
    mask: masky,
    inverse: true,
  });

  app.stage.addChild(rect, masky);
  app.stage.position.set((window.innerWidth / 2) - 200, (window.innerHeight / 2) - 200);
})();
