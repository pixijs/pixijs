// description: This example demonstrates how to create and display textures with various rotations using PixiJS.
import { Application, Assets, groupD8, Rectangle, Sprite, Text, Texture } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the texture
  const texture = await Assets.load('https://pixijs.com/assets/flowerTop.png');

  // Create rotated textures
  const textures = [texture];
  const D8 = groupD8;

  for (let rotate = 1; rotate < 16; rotate++) {
    const h = D8.isVertical(rotate) ? texture.frame.width : texture.frame.height;
    const w = D8.isVertical(rotate) ? texture.frame.height : texture.frame.width;

    const { frame } = texture;
    const crop = new Rectangle(texture.frame.x, texture.frame.y, w, h);
    const trim = crop;
    let rotatedTexture;

    if (rotate % 2 === 0) {
      rotatedTexture = new Texture({
        source: texture.baseTexture,
        frame,
        orig: crop,
        trim,
        rotate,
      });
    } else {
      rotatedTexture = new Texture({
        source: texture.baseTexture,
        frame,
        orig: crop,
        trim,
        rotate,
      });
    }
    textures.push(rotatedTexture);
  }

  const offsetX = (app.screen.width / 16) | 0;
  const offsetY = (app.screen.height / 8) | 0;
  const gridW = (app.screen.width / 4) | 0;
  const gridH = (app.screen.height / 5) | 0;

  // Normal rotations and mirrors
  for (let i = 0; i < 16; i++) {
    // Create a new Sprite using rotated texture
    const dude = new Sprite(textures[i < 8 ? i * 2 : ((i - 8) * 2) + 1]);

    dude.scale.x = 0.5;
    dude.scale.y = 0.5;
    // Show it in grid
    dude.x = offsetX + (gridW * (i % 4));
    dude.y = offsetY + (gridH * ((i / 4) | 0));
    app.stage.addChild(dude);
    const text = new Text({
      text: `rotate = ${dude.texture.rotate}`,
      style: {
        fontFamily: 'Courier New',
        fontSize: '12px',
        fill: 'white',
        align: 'left',
      },
    });

    text.x = dude.x;
    text.y = dude.y - 20;
    app.stage.addChild(text);
  }
})();
