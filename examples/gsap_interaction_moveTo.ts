// description: This example demonstrates how to use GSAP's quickTo method to create smooth, performant interactions with PixiJS, allowing a sprite to follow the user's pointer movements.
import { gsap } from 'gsap';
import { Application, Assets, Sprite, TextureSource } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  TextureSource.defaultOptions.scaleMode = 'nearest';
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  const logo = new Sprite({
    texture,
    anchor: 0.5,
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  });

  logo.width = 100;
  logo.scale.y = logo.scale.x;
  logo.eventMode = 'static';

  const xTo = gsap.quickTo(logo, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(logo, 'y', { duration: 0.6, ease: 'power3' });

  logo.on('globalpointermove', (event) => {
    // Use quickTo to move the logo to the pointer position
    xTo(event.global.x);
    yTo(event.global.y);
  });

  // Add the logo to the stage
  app.stage.addChild(logo);
})();
