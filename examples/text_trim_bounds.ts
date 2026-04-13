// description: This example demonstrates the difference between trimmed and untrimmed text using the trim option.
import { Application, Graphics, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const text = new Text({
    text: 'UNTRIMMED TEXT',
    style: {
      fontFamily: 'Arial',
      fontSize: 60,
      fill: 'white',
    },
    anchor: 0.5,
    position: { x: window.innerWidth / 2, y: (window.innerHeight / 2) - 50 },
  });

  app.stage.addChild(text);

  const text2 = new Text({
    text: 'TRIMMED TEXT',
    style: {
      fontFamily: 'Arial',
      fontSize: 60,
      fill: 'white',
      trim: true, // Enable text trimming
    },
    anchor: 0.5,
    position: { x: window.innerWidth / 2, y: (window.innerHeight / 2) + text.height + 10 },
  });

  app.stage.addChild(text2);

  const tb = text.getBounds();
  const textRect = new Graphics();

  textRect.rect(tb.x, tb.y, tb.width, tb.height);
  textRect.stroke({ width: 2, color: '#FFD600' });
  app.stage.addChild(textRect);

  const tb2 = text2.getBounds();
  const textRect2 = new Graphics();

  textRect2.rect(tb2.x, tb2.y, tb2.width, tb2.height);
  textRect2.stroke({ width: 2, color: '#FFD600' });
  app.stage.addChild(textRect2);
})();
