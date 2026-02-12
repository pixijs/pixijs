// description: This example demonstrates how to create and animate a basic textured MeshRope using PixiJS.
import { Application, Assets, Container, MeshRope, Point } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the snake texture
  const texture = await Assets.load('https://pixijs.com/assets/snake.png');

  let count = 0;

  // Build a rope from points!
  const ropeLength = 918 / 20;
  const points = [];

  for (let i = 0; i < 20; i++) {
    points.push(new Point(i * ropeLength, 0));
  }

  // Create the snake MeshRope
  const strip = new MeshRope({ texture, points });

  strip.x = -459;

  const snakeContainer = new Container();

  snakeContainer.x = 400;
  snakeContainer.y = 300;

  snakeContainer.scale.set(800 / 1100);
  app.stage.addChild(snakeContainer);

  snakeContainer.addChild(strip);

  // Animate the rope points
  app.ticker.add(() => {
    count += 0.1;

    // make the snake
    for (let i = 0; i < points.length; i++) {
      points[i].y = Math.sin((i * 0.5) + count) * 30;
      points[i].x = (i * ropeLength) + (Math.cos((i * 0.3) + count) * 20);
    }
  });
})();
