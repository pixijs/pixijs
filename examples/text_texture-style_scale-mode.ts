// description: This example demonstrates how to create and display bitmap text and regular text with different texture scaling modes through TextureStyle.
import { Application, Assets, BitmapFont, BitmapText, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  await Assets.load('https://pixijs.com/assets/webfont-loader/PixelifySans.ttf');

  BitmapFont.install({
    name: 'Custom',
    style: {
      fontFamily: 'PixelifySans',
      fontSize: 140,
      fill: '#ffffff',
    },
    chars: [
      ['a', 'z'],
      ['A', 'Z'],
      ['0', '9'],
    ],
    resolution: 2,
    padding: 4,
    textureStyle: {
      scaleMode: 'nearest',
    },
  });

  const text = new BitmapText({
    text: 'Nearest',
    style: {
      fontFamily: 'Custom',
      fontSize: 70,
      fill: 'white',
      align: 'center',
    },
    scale: 2,
    anchor: 0.5,
    position: { x: window.innerWidth / 2, y: (window.innerHeight / 2) - 75 },
  });

  const text2 = new Text({
    text: 'Linear',
    style: {
      fontFamily: 'PixelifySans',
      fontSize: 70,
      fill: 'white',
      align: 'center',
    },
    scale: 2,
    textureStyle: {
      scaleMode: 'linear',
    },
    anchor: 0.5,
    position: { x: window.innerWidth / 2, y: (window.innerHeight / 2) + 75 },
  });

  app.stage.addChild(text, text2);
})();
