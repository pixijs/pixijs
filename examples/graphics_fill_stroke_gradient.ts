// description: This example demonstrates how to create and animate shapes with gradient fills and strokes using the Graphics and FillGradient classes
import { Application, FillGradient, Graphics } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create a color array for the linear gradient
  const colorStops = [0xffffff, 0xff0000, 0x00ff00, 0x0000ff, 0x000000];

  // Create a fill gradient
  const gradientFill = new FillGradient(0, 0, 1, 1);

  // Add the color stops to the fill gradient
  colorStops.forEach((number, index) => {
    const ratio = index / colorStops.length;

    gradientFill.addColorStop(ratio, number);
  });

  // Create a fill graphic
  const graphic1 = new Graphics().roundRect(0, 0, 150, 150, 50).fill(gradientFill);

  // Create a stroke graphic
  const graphic2 = new Graphics().roundRect(0, 0, 150, 150, 50).stroke({ width: 20, fill: gradientFill });

  graphic1.pivot.set(75, 75);
  graphic1.x = 150;
  graphic1.y = 200;

  graphic2.x = 350;
  graphic2.y = 125;

  app.stage.addChild(graphic1);
  app.stage.addChild(graphic2);

  let tick = 0;

  // Animate the graphics
  app.ticker.add(() => {
    tick += 0.025;
    graphic1.rotation += 0.01;
    graphic2
      .clear()
      .roundRect(0, 0, 150, 150, 50)
      .stroke({ width: Math.sin(tick) * 100, fill: gradientFill });
  });
})();
