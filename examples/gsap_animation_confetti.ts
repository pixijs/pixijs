// description: This example demonstrates how to create a GSAP confetti animation with PixiJS, triggered by user clicks.
import { gsap } from 'gsap';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import { Application, Assets, Graphics, Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';

gsap.registerPlugin(Physics2DPlugin);

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window, antialias: true });
  await Assets.load('https://pixijs.com/assets/webfont-loader/Grandstander-ExtraBold.ttf');

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  app.stage.eventMode = 'static'; // Set the stage to static event mode
  app.stage.cursor = 'pointer'; // Change cursor to pointer on hover
  app.stage.hitArea = app.screen; // Set the hit area to the entire screen

  app.stage.addEventListener('click', (event) => {
    // Generate a random number of dots
    const dotCount = gsap.utils.random(15, 30, 1);
    const colors = ['white'];

    for (let i = 0; i < dotCount; i++) {
      // Create a dot element
      const dot = new Graphics()
        .circle(0, 0, gsap.utils.random(20, 40))
        .fill('white') // Pick a random color
        .stroke({ color: 'white', width: 2 }); // Add a white stroke

      dot.filters = [
        new DropShadowFilter({
          color: 'black',
          alpha: 0.5,
          blur: 4,
          offset: { x: 0, y: 5 },
        }),
      ];

      app.stage.addChild(dot);

      // Set initial position and styles of the dot
      gsap.set(dot, {
        tint: gsap.utils.random(colors), // Pick a random color
        y: event.clientY, // position dot at coordinates of the click
        x: event.clientX,
        scale: 0, // Start at scale 0
      });

      // Animate the dot with physics2D
      gsap
        .timeline({
          onComplete: () => dot.destroy(), // Clean up the dot after animation
        })
        .to(dot, {
          scale: gsap.utils.random(0.3, 1), // Random scale for the pop-in effect
          duration: 0.02, // Quick pop-in effect
          ease: 'power3.out',
        })
        .to(dot, {
          duration: 2,
          physics2D: {
            velocity: gsap.utils.random(500, 1000), // Random velocity
            angle: gsap.utils.random(0, 360), // Random direction
            gravity: 1500, // Gravity effect
          },
          ease: 'none',
        }); // Start together with the previous tween
    }
  });

  // add some text to the stage
  const text = new Text({
    text: 'Click to create confetti',
    style: {
      fontFamily: 'Grandstander ExtraBold',
      fontSize: 50,
      fill: 'white',
      align: 'center',
    },
    anchor: 0.5,
    x: app.screen.width / 2,
    y: (app.screen.height / 2) - 50,
  });

  text.filters = [
    new DropShadowFilter({
      color: 'black',
      alpha: 0.5,
      blur: 4,
      offset: { x: 0, y: 5 },
    }),
  ];

  app.stage.addChild(text);
})();
