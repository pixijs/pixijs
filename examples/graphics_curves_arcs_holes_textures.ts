// description: This example demonstrates advanced graphics features, including Bezier curves, arcs, holes, and textured strokes.
import { Application, Assets, Graphics, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load texture
  const texture = await Assets.load('https://pixijs.com/assets/bg_rotate.jpg');

  const sprite = new Sprite(texture);

  // // BEZIER CURVE ////
  // information: https://en.wikipedia.org/wiki/Bézier_curve

  const realPath = new Graphics();

  realPath.moveTo(0, 0);
  realPath.lineTo(100, 200);
  realPath.lineTo(200, 200);
  realPath.lineTo(240, 100);
  realPath.stroke({ width: 2, color: 0xffffff });

  realPath.position.x = 50;
  realPath.position.y = 50;

  app.stage.addChild(realPath);

  const bezier = new Graphics();

  bezier.bezierCurveTo(100, 200, 200, 200, 240, 100);
  bezier.stroke({ width: 5, color: 0xaa0000 });

  bezier.position.x = 50;
  bezier.position.y = 50;

  app.stage.addChild(bezier);

  // // BEZIER CURVE 2 ////
  const realPath2 = new Graphics();

  realPath2.moveTo(0, 0);
  realPath2.lineTo(0, -100);
  realPath2.lineTo(150, 150);
  realPath2.lineTo(240, 100);
  realPath2.stroke({ width: 2, color: 0xffffff });

  realPath2.position.x = 320;
  realPath2.position.y = 150;

  app.stage.addChild(realPath2);

  const bezier2 = new Graphics();

  bezier2.bezierCurveTo(0, -100, 150, 150, 240, 100);
  bezier2.stroke({ width: 10, texture: sprite.texture });

  bezier2.position.x = 320;
  bezier2.position.y = 150;

  app.stage.addChild(bezier2);

  // // ARC ////
  const arc = new Graphics();

  arc.arc(600, 100, 50, Math.PI, 2 * Math.PI);
  arc.stroke({ width: 5, color: 0xaa00bb });

  app.stage.addChild(arc);

  // // ARC 2 ////
  const arc2 = new Graphics();

  arc2.arc(650, 270, 60, 2 * Math.PI, (3 * Math.PI) / 2);
  arc2.stroke({ width: 6, color: 0x3333dd });

  app.stage.addChild(arc2);

  // // ARC 3 ////
  const arc3 = new Graphics();

  arc3.arc(650, 420, 60, 2 * Math.PI, (2.5 * Math.PI) / 2);
  arc3.stroke({ width: 20, texture: sprite.texture });

  app.stage.addChild(arc3);

  // / Hole ////
  const rectAndHole = new Graphics();

  rectAndHole.rect(350, 350, 150, 150);
  rectAndHole.fill(0x00ff00);
  rectAndHole.circle(375, 375, 25);
  rectAndHole.circle(425, 425, 25);
  rectAndHole.circle(475, 475, 25);
  rectAndHole.cut();

  app.stage.addChild(rectAndHole);

  // // Line Texture Style ////
  const beatifulRect = new Graphics();

  beatifulRect.rect(80, 350, 150, 150);
  beatifulRect.fill(0xff0000);
  beatifulRect.stroke({ width: 20, texture: sprite.texture });

  app.stage.addChild(beatifulRect);
})();
