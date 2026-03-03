// description: This example demonstrates how to implement dragging functionality for sprites using pointer events
import { Application, Assets, SCALE_MODES, Sprite } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Set the texture's scale mode to nearest to preserve pixelation
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

  for (let i = 0; i < 10; i++) {
    createBunny(Math.floor(Math.random() * app.screen.width), Math.floor(Math.random() * app.screen.height));
  }

  function createBunny(x, y) {
    // Create our little bunny friend..
    const bunny = new Sprite(texture);

    // Enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.eventMode = 'static';

    // This button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.cursor = 'pointer';

    // Center the bunny's anchor point
    bunny.anchor.set(0.5);

    // Make it a bit bigger, so it's easier to grab
    bunny.scale.set(3);

    // Setup events for mouse + touch using the pointer events
    bunny.on('pointerdown', onDragStart, bunny);

    // Move the sprite to its designated position
    bunny.x = x;
    bunny.y = y;

    // Add it to the stage
    app.stage.addChild(bunny);
  }

  let dragTarget = null;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerup', onDragEnd);
  app.stage.on('pointerupoutside', onDragEnd);

  function onDragMove(event) {
    if (dragTarget) {
      dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
  }

  function onDragStart(this: any) {
    // Store a reference to the data
    // * The reason for this is because of multitouch *
    // * We want to track the movement of this particular touch *
    this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
  }

  function onDragEnd() {
    if (dragTarget) {
      app.stage.off('pointermove', onDragMove);
      dragTarget.alpha = 1;
      dragTarget = null;
    }
  }
})();
