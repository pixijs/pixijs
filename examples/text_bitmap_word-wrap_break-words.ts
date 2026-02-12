// description: This example demonstrates how to use the breakWords option in BitmapText to wrap long, unbroken strings.
import { Application, Assets, BitmapText } from 'pixi.js';

(async () => {
  const app = new Application();
  await app.init({ background: '#1099bb', resizeTo: window });
  document.body.appendChild(app.canvas);

  // Load a bitmap font
  await Assets.load('https://pixijs.com/assets/bitmap-font/desyrel.xml');

  // Create BitmapText with long, unbroken string
  const text = new BitmapText({
    text: 'This_Is_A_Really_Long_Word_That_Would_Normally_Overflow_But_With_BreakWords_It_Wraps!',
    style: {
      fontFamily: 'Desyrel',
      wordWrapWidth: app.screen.width - 100, // Set a width for wrapping
      wordWrap: true,
      fontSize: 50,
      letterSpacing: 10,
      breakWords: true, // This forces the long word to wrap
    },
    anchor: 0.5,
  });

  text.position.set(app.screen.width / 2, app.screen.height / 2);

  app.stage.addChild(text);
})();
