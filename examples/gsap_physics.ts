// description: This example demonstrates how to create a GSAP physics-based cannon animation with PixiJS, where bullets are fired from a cannon on user clicks.
import { gsap } from 'gsap';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import { Application, Container, Graphics } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';

gsap.registerPlugin(Physics2DPlugin);
(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window, antialias: true });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const masterTl = gsap.timeline({
    paused: true,
  });
  const cannon = new Graphics().roundPoly(0, 0, 50, 3, 10).fill(0xed427c).stroke({ color: 'white', width: 4 });

  cannon.filters = [
    new DropShadowFilter({
      color: 'black',
      alpha: 0.25,
      blur: 4,
      offset: { x: 0, y: 10 },
    }),
  ];
  cannon.x = app.screen.width / 2;
  cannon.y = app.screen.height - 100;
  const angle = 20;
  const tl1 = gsap
    .timeline()
    .to(cannon, {
      angle: -angle,
      duration: 0.65,
      ease: 'power1.inOut',
    })
    .to(cannon, {
      angle,
      ease: 'power1.inOut',
      duration: 1,
      repeat: 3,
      yoyo: true,
    })
    .to(cannon, {
      angle: 0,
      duration: 0.65,
      ease: 'power1.inOut',
    });

  const bullets = [];
  const bulletsContainer = new Container();

  app.stage.addChild(bulletsContainer);
  app.stage.addChild(cannon);
  bulletsContainer.x = app.screen.width / 2;
  bulletsContainer.y = app.screen.height - 100;
  const tl1Time = tl1.duration();

  for (let i = 0; i < 40; i++) {
    const bullet = new Graphics().circle(0, 0, 30).fill({ color: 0xffffff });

    bullet.filters = [
      new DropShadowFilter({
        color: 'black',
        alpha: 0.25,
        blur: 4,
        offset: { x: 0, y: 10 },
      }),
    ];

    bulletsContainer.addChild(bullet);
    bullets.push(bullet);

    // Set initial properties
    gsap.set(bullet, {
      scale: gsap.utils.random(0.4, 0.6),
      alpha: 0,
    });
  }

  // Update the timeline for PixiJS objects
  const tl2 = gsap
    .timeline()
    .to(bullets, {
      alpha: 1,
      duration: 0.25,
      stagger: {
        amount: tl1Time,
      },
    })
    .to(
      bullets,
      {
        duration: tl1Time,
        physics2D: {
          velocity: 'random(600, 850)',
          angle: () => 270 + Number(gsap.getProperty(cannon, 'angle')),
          gravity: 600,
        },
        stagger: {
          amount: tl1Time,
        },
      },
      0,
    );

  masterTl.add(tl1, 0).add(tl2, 0).play();

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('click', () => masterTl.restart());
})();
