// description: This example demonstrates how to create and display bitmap text using a loaded bitmap font.
import { Application, Assets, BitmapText } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load bitmap font
  await Assets.load('https://pixijs.com/assets/bitmap-font/desyrel.xml');

  const bitmapFontText = new BitmapText({
    text: 'bitmap fonts are supported!\nWoo yay!',
    style: {
      fontFamily: 'Desyrel',
      fontSize: 55,
      align: 'left',
    },
  });

  bitmapFontText.x = 50;
  bitmapFontText.y = 200;

  app.stage.addChild(bitmapFontText);
})();
