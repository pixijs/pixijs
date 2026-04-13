// description: This example demonstrates how to split bitmap text into characters for individual animation using SplitBitmapText.
import { gsap } from 'gsap';
import { Application, Assets, BitmapText, Container, SplitBitmapText } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  await Assets.load('https://pixijs.com/assets/bitmap-font/desyrel.xml');

  const scene = new Container();
  scene.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(scene);

  const bitmapFontText = new BitmapText({
    text: 'Break apart text into characters, words, and/or lines for easy animation.',
    style: {
      fontFamily: 'Desyrel',
      fontSize: 60,
      fill: 'white',
      wordWrap: true,
      wordWrapWidth: app.screen.width - 100,
    },
    alpha: 0.5,
  });
  const splitText = new SplitBitmapText({
    text: 'Break apart text into characters, words, and/or lines for easy animation.',
    style: {
      fontFamily: 'Desyrel',
      fontSize: 60,
      fill: 0x0,
      wordWrap: true,
      wordWrapWidth: app.screen.width - 100,
    },
    alpha: 1,
  });
  bitmapFontText.x = splitText.x = -bitmapFontText.width / 2;
  bitmapFontText.y = splitText.y = -bitmapFontText.height / 2;
  scene.addChild(bitmapFontText, splitText);

  gsap.from(splitText.chars, {
    x: 150,
    alpha: 0,
    duration: 0.7,
    ease: 'power4',
    stagger: 0.04,
    repeat: -1,
    yoyo: true,
  });
})();
