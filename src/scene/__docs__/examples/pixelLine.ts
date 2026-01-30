import { Application, Container, Graphics, Text } from 'pixi.js';

/**
 * Creates a grid pattern using Graphics lines
 * @param graphics - The Graphics object to draw on
 * @returns The Graphics object with the grid drawn
 */
function buildGrid(graphics: Graphics) {
  // Draw 10 vertical lines spaced 10 pixels apart
  for (let i = 0; i < 11; i++) {
    // Move to top of each line (x = i*10, y = 0)
    graphics
      .moveTo(i * 10, 0)
    // Draw down to bottom (x = i*10, y = 100)
      .lineTo(i * 10, 100);
  }

  // Draw 10 horizontal lines spaced 10 pixels apart
  for (let i = 0; i < 11; i++) {
    // Move to start of each line (x = 0, y = i*10)
    graphics
      .moveTo(0, i * 10)
    // Draw across to end (x = 100, y = i*10)
      .lineTo(100, i * 10);
  }

  return graphics;
}

(async () => {
  // Create and initialize a new PixiJS application
  const app = new Application();

  await app.init({ antialias: true, resizeTo: window });
  document.body.appendChild(app.canvas);

  // Create two grids - one with pixel-perfect lines and one without
  const gridPixel = buildGrid(new Graphics()).stroke({ color: 0xffffff, pixelLine: true, width: 1 });

  const grid = buildGrid(new Graphics()).stroke({ color: 0xffffff, pixelLine: false });

  // Position the grids side by side
  grid.x = -100;
  grid.y = -50;
  gridPixel.y = -50;

  // Create a container to hold both grids
  const container = new Container();

  container.addChild(grid, gridPixel);

  // Center the container on screen
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;
  app.stage.addChild(container);

  // Animation variables
  let count = 0;

  // Add animation to scale the grids over time
  app.ticker.add(() => {
    count += 0.01;
    container.scale = 1 + ((Math.sin(count) + 1) * 2);
  });

  // Add descriptive label
  const label = new Text({
    text: 'Grid Comparison: Standard Lines (Left) vs Pixel-Perfect Lines (Right)',
    style: { fill: 0xffffff },
  });

  // Position label in top-left corner
  label.position.set(20, 20);
  label.width = app.screen.width - 40;
  label.scale.y = label.scale.x;
  app.stage.addChild(label);
})();
