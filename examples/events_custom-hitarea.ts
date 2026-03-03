// description: This example demonstrates how to create interactive buttons with custom hit areas and masks
import { Application, Assets, Graphics, Polygon, Sprite, Text, TextStyle } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the star texture
  const starTexture = await Assets.load('https://pixijs.com/assets/yellowstar.png');

  // Standard Sprite Button
  const starButton1 = new Sprite(starTexture);

  starButton1.position.set(50, 200);
  starButton1.cursor = 'pointer';
  starButton1.eventMode = 'static';

  starButton1
    .on('pointerdown', onClick, starButton1)
    .on('pointerover', onPointerOver, starButton1)
    .on('pointerout', onPointerOut, starButton1);

  // Custom Hitarea Button
  const starButton2 = new Sprite(starTexture);

  starButton2.position.set(250, 200);

  // Create a hitarea that matches the sprite, which will be used for point intersection
  starButton2.hitArea = new Polygon([
    80, 0, 100, 50, 160, 55, 115, 95, 130, 150, 80, 120, 30, 150, 45, 95, 0, 55, 60, 50,
  ]);
  starButton2.cursor = 'pointer';
  starButton2.eventMode = 'static';

  starButton2
    .on('pointerdown', onClick, starButton2)
    .on('pointerover', onPointerOver, starButton2)
    .on('pointerout', onPointerOut, starButton2);

  // With Mask, No Hit Area
  const starButton3 = new Sprite(starTexture);

  starButton3.position.set(450, 200);
  starButton3.cursor = 'pointer';
  starButton3.eventMode = 'static';

  const squareMask = new Graphics().rect(starButton3.x, starButton3.y, 75, 200).fill({ color: 0xffffff });

  starButton3.mask = squareMask;

  starButton3
    .on('pointerdown', onClick, starButton3)
    .on('pointerover', onPointerOver, starButton3)
    .on('pointerout', onPointerOut, starButton3);

  // With a Mask and Hit Area
  // Hitareas ignore masks. You can still click on a button made in this way,
  // even from areas covered by a mask
  const starButton4 = new Sprite(starTexture);

  starButton4.position.set(600, 200);

  const squareMask2 = new Graphics().rect(starButton4.x, starButton4.y, 75, 200).fill({ color: 0xffffff });

  starButton4.mask = squareMask2;

  // Again, hitarea for intersection checks
  starButton4.hitArea = new Polygon([
    80, 0, 100, 50, 160, 55, 115, 95, 130, 150, 80, 120, 30, 150, 45, 95, 0, 55, 60, 50,
  ]);
  starButton4.cursor = 'pointer';
  starButton4.eventMode = 'static';

  starButton4
    .on('pointerdown', onClick, starButton4)
    .on('pointerover', onPointerOver, starButton4)
    .on('pointerout', onPointerOut, starButton4);

  const style = new TextStyle({ fill: '#ffffff' });

  const text1 = new Text({ text: 'Standard', style });

  text1.x = starButton1.x + 25;
  text1.y = starButton1.y + 170;

  const text2 = new Text({ text: 'Hit Area', style });

  text2.x = starButton2.x + 35;
  text2.y = starButton2.y + 170;

  const text3 = new Text({ text: 'Mask', style });

  text3.x = starButton3.x + 10;
  text3.y = starButton3.y + 170;

  const text4 = new Text({ text: 'Mask + Hit Area', style });

  text4.x = starButton4.x - 10;
  text4.y = starButton4.y + 170;

  // Add to stage
  app.stage.addChild(
    starButton2,
    starButton1,
    starButton3,
    starButton4,
    squareMask,
    squareMask2,
    text1,
    text2,
    text3,
    text4,
  );

  function onClick(this: any) {
    this.tint = 0x333333;
  }

  function onPointerOver(this: any) {
    this.tint = 0x666666;
  }

  function onPointerOut(this: any) {
    this.tint = 0xffffff;
  }
})();
