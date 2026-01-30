// description: This example demonstrates how to create and animate a textured MeshRope to simulate a snake-like movement using PixiJS.
import { Application, Assets, Graphics, MeshRope, Point } from 'pixi.js';

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
  const ropeLength = 45;

  const points = [];

  for (let i = 0; i < 25; i++) {
    points.push(new Point(i * ropeLength, 0));
  }

  // Create the snake MeshRope
  const strip = new MeshRope({ texture, points });

  strip.x = -40;
  strip.y = 300;

  app.stage.addChild(strip);

  const g = new Graphics();

  g.x = strip.x;
  g.y = strip.y;
  app.stage.addChild(g);

  // Start animating
  app.ticker.add(() => {
    count += 0.1;

    // Make the snake
    for (let i = 0; i < points.length; i++) {
      points[i].y = Math.sin((i * 0.5) + count) * 30;
      points[i].x = (i * ropeLength) + (Math.cos((i * 0.3) + count) * 20);
    }
    renderPoints();
  });

  function renderPoints() {
    g.clear();
    g.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      g.lineTo(points[i].x, points[i].y);
      g.stroke({ width: 2, color: 0xffc2c2 });
    }

    for (let i = 1; i < points.length; i++) {
      g.drawCircle(points[i].x, points[i].y, 10);
      g.fill({ color: 0xff0022 });
      g.stroke({ width: 2, color: 0xffc2c2 });
    }
  }
})();
