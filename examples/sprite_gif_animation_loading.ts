// description: This example demonstrates how to load and display a GIF image using the GifSprite class.
import { Application, Assets } from 'pixi.js';
import { GifSprite } from 'pixi.js/gif';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const source = await Assets.load('https://userland.pixijs.io/gif/examples/chew.gif');
  const gif = new GifSprite({ source, x: window.innerWidth / 2, y: window.innerHeight / 2, anchor: 0.5 });

  app.stage.addChild(gif);
})();
