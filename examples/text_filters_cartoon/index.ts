// description: Example of using baked in filters on a Text object to create a cartoon-style text effect.
import { Application, Assets, Text } from 'pixi.js';
import { CartoonTextFilter } from './CartoonTextFilter';

(async () => {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: '#1099bb',
    autoDensity: true,
    antialias: true,
  });
  document.body.appendChild(app.canvas);

  await Assets.load('https://pixijs.com/assets/webfont-loader/Grandstander-ExtraBold.ttf');

  const filter = new CartoonTextFilter({
    thickness: 7,
  });

  const text = new Text({
    text: 'Hello World!',
    style: {
      fontFamily: 'Grandstander ExtraBold',
      fontSize: 70,
      fill: 0xffffff,
      padding: 0,
      filters: [filter],
      fontWeight: '800',
    },
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    anchor: 0.5,
  });

  app.stage.addChild(text);
})();
