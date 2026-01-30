// description: This example demonstrates the new experimental Canvas renderer in PixiJS.
import { Application, Container, Graphics, Text } from 'pixi.js';

(async () => {
  const app = new Application();

  await app.init({
    preference: 'canvas',
    background: '#2c3e50',
    resizeTo: window,
  });
  document.body.appendChild(app.canvas);

  const scene = new Container();
  scene.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(scene);

  // Draw some shapes to show the canvas renderer in action
  const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6];
  const shapes = [];

  for (let i = 0; i < 5; i++) {
    const shape = new Graphics().roundRect(-40, -40, 80, 80, 12).fill(colors[i]);

    shape.x = (i - 2) * 100;
    shape.y = 0;
    scene.addChild(shape);
    shapes.push(shape);
  }

  const label = new Text({
    text: 'Canvas Renderer',
    style: {
      fontFamily: 'Arial',
      fontSize: 32,
      fontWeight: 'bold',
      fill: 'white',
    },
  });
  label.anchor.set(0.5);
  label.y = -100;
  scene.addChild(label);

  const sublabel = new Text({
    text: `Renderer: ${app.renderer.name}`,
    style: {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#bdc3c7',
    },
  });
  sublabel.anchor.set(0.5);
  sublabel.y = 100;
  scene.addChild(sublabel);

  // Animate shapes
  let time = 0;
  app.ticker.add((ticker) => {
    time += ticker.deltaTime * 0.02;

    for (let i = 0; i < shapes.length; i++) {
      shapes[i].y = Math.sin(time + (i * 0.8)) * 40;
      shapes[i].rotation += 0.01 * ticker.deltaTime;
    }
  });
})();
