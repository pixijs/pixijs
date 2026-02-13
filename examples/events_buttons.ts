// description: This example demonstrates how to create interactive buttons with different states (normal, hover, pressed)
import { Application, Assets, Sprite, Texture } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load textures
  await Assets.load([
    'https://pixijs.com/assets/bg_button.jpg',
    'https://pixijs.com/assets/button.png',
    'https://pixijs.com/assets/button_down.png',
    'https://pixijs.com/assets/button_over.png',
  ]);

  // Create a background...
  const background = Sprite.from('https://pixijs.com/assets/bg_button.jpg');

  background.width = app.screen.width;
  background.height = app.screen.height;

  // Add background to stage...
  app.stage.addChild(background);

  // Create some textures from an image path
  const textureButton = Texture.from('https://pixijs.com/assets/button.png');
  const textureButtonDown = Texture.from('https://pixijs.com/assets/button_down.png');
  const textureButtonOver = Texture.from('https://pixijs.com/assets/button_over.png');

  const buttons = [];

  const buttonPositions = [175, 75, 655, 75, 410, 325, 150, 465, 685, 445];

  for (let i = 0; i < 5; i++) {
    const button = new Sprite(textureButton);

    button.anchor.set(0.5);
    button.x = buttonPositions[i * 2];
    button.y = buttonPositions[(i * 2) + 1];

    // Make the button interactive...
    button.eventMode = 'static';
    button.cursor = 'pointer';

    button
      // Mouse & touch events are normalized into
      // the pointer* events for handling different
      // button events.
      .on('pointerdown', onButtonDown)
      .on('pointerup', onButtonUp)
      .on('pointerupoutside', onButtonUp)
      .on('pointerover', onButtonOver)
      .on('pointerout', onButtonOut);

    // Use mouse-only events
    // .on('mousedown', onButtonDown)
    // .on('mouseup', onButtonUp)
    // .on('mouseupoutside', onButtonUp)
    // .on('mouseover', onButtonOver)
    // .on('mouseout', onButtonOut)

    // Use touch-only events
    // .on('touchstart', onButtonDown)
    // .on('touchend', onButtonUp)
    // .on('touchendoutside', onButtonUp)

    // Add it to the stage
    app.stage.addChild(button);

    // Add button to array
    buttons.push(button);
  }

  // Set some silly values...
  buttons[0].scale.set(1.2);
  buttons[2].rotation = Math.PI / 10;
  buttons[3].scale.set(0.8);
  buttons[4].scale.set(0.8, 1.2);
  buttons[4].rotation = Math.PI;

  function onButtonDown(this: any) {
    this.isdown = true;
    this.texture = textureButtonDown;
    this.alpha = 1;
  }

  function onButtonUp(this: any) {
    this.isdown = false;
    if (this.isOver) {
      this.texture = textureButtonOver;
    } else {
      this.texture = textureButton;
    }
  }

  function onButtonOver(this: any) {
    this.isOver = true;
    if (this.isdown) {
      return;
    }
    this.texture = textureButtonOver;
  }

  function onButtonOut(this: any) {
    this.isOver = false;
    if (this.isdown) {
      return;
    }
    this.texture = textureButton;
  }
})();
