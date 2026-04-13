// description: This example demonstrates dynamic drawing using the Graphics class
import { Application, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;

  const graphics = new Graphics();

  // Draw a shape
  graphics
    .moveTo(50, 50)
    .lineTo(250, 50)
    .lineTo(100, 100)
    .lineTo(250, 220)
    .lineTo(50, 220)
    .lineTo(50, 50)
    .fill({ color: 0xff3300 })
    .stroke({ width: 10, color: 0xffd900 });

  // Draw a second shape
  graphics
    .moveTo(210, 300)
    .lineTo(450, 320)
    .lineTo(570, 350)
    .quadraticCurveTo(600, 0, 480, 100)
    .lineTo(330, 120)
    .lineTo(410, 200)
    .lineTo(210, 300)
    .fill({ color: 0xff700b })
    .stroke({ width: 10, color: 0xff0000, alpha: 0.8 });

  // Draw a rectangle
  graphics.rect(50, 250, 100, 100);
  graphics.stroke({ width: 2, color: 0x0000ff });

  // Draw a circle
  graphics.circle(470, 200, 100);
  graphics.fill({ color: 0xffff0b, alpha: 0.5 });

  graphics.moveTo(30, 30);
  graphics.lineTo(600, 300);
  graphics.stroke({ width: 20, color: 0x33ff00 });

  app.stage.addChild(graphics);

  // Let's create a moving shape
  const thing = new Graphics();

  app.stage.addChild(thing);
  thing.x = 800 / 2;
  thing.y = 600 / 2;

  let count = 0;

  // Just click on the stage to draw random lines
  (window as any).app = app;
  app.stage.on('pointerdown', () => {
    graphics.moveTo(Math.random() * 800, Math.random() * 600);
    graphics.bezierCurveTo(
      Math.random() * 800,
      Math.random() * 600,
      Math.random() * 800,
      Math.random() * 600,
      Math.random() * 800,
      Math.random() * 600,
    );
    graphics.stroke({ width: Math.random() * 30, color: Math.random() * 0xffffff });
  });

  // Animate the moving shape
  app.ticker.add(() => {
    count += 0.1;

    thing.clear();

    thing
      .moveTo(-120 + (Math.sin(count) * 20), -100 + (Math.cos(count) * 20))
      .lineTo(120 + (Math.cos(count) * 20), -100 + (Math.sin(count) * 20))
      .lineTo(120 + (Math.sin(count) * 20), 100 + (Math.cos(count) * 20))
      .lineTo(-120 + (Math.cos(count) * 20), 100 + (Math.sin(count) * 20))
      .lineTo(-120 + (Math.sin(count) * 20), -100 + (Math.cos(count) * 20))
      .fill({ color: 0xffff00, alpha: 0.5 })
      .stroke({ width: 10, color: 0xff0000 });

    thing.rotation = count * 0.1;
  });
})();
