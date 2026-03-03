// description: This example demonstrates how to create a GSAP interaction inertia effect with PixiJS, where sprites react to mouse movement with inertia.
import { gsap } from 'gsap';
import InertiaPlugin from 'gsap/InertiaPlugin';
import { Application, Assets, Container, Sprite } from 'pixi.js';

gsap.registerPlugin(InertiaPlugin);

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);

  // Load the bunny texture
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

  // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const holder = new Container();
    const bunny = new Sprite(texture);

    holder.x = (i % 5) * 40;
    holder.y = Math.floor(i / 5) * 40;
    holder.addChild(bunny);
    holder.origin.set(bunny.width / 2, bunny.height / 2);
    container.addChild(holder);
  }

  // Move the container to the center
  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  // Center the bunny sprites in local container coordinates
  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  let oldX = 0;
  let oldY = 0;
  let deltaX = 0;
  let deltaY = 0;

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointermove', (e) => {
    // Calculate horizontal movement since the last mouse position
    deltaX = e.clientX - oldX;

    // Calculate vertical movement since the last mouse position
    deltaY = e.clientY - oldY;

    // Update old coordinates with the current mouse position
    oldX = e.clientX;
    oldY = e.clientY;
  });

  container.children.forEach((holder) => {
    holder.eventMode = 'static';
    holder.on('pointerover', () => {
      const tl = gsap.timeline({
        onComplete: () => {
          tl.kill();
        },
      });

      tl.timeScale(1.2); // Animation will play 20% faster than normal

      const image = holder.getChildAt(0);

      tl.to(image, {
        inertia: {
          x: {
            velocity: deltaX * 30, // Higher number = movement amplified
            end: 0, // Go back to the initial position
          },
          y: {
            velocity: deltaY * 30, // Higher number = movement amplified
            end: 0, // Go back to the initial position
          },
        },
      });
      tl.fromTo(
        image,
        {
          angle: 0,
        },
        {
          duration: 0.4,
          angle: (Math.random() - 0.5) * 30, // Returns a value between -15 & 15
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut', // Will slow at the begin and the end
        },
        '<',
      ); // The animation starts at the same time as the previous tween
    });
  });
})();
