// description: This example demonstrates how to create a GSAP keyframe animation with PixiJS, animating multiple boxes with staggered timing.
import { gsap } from 'gsap';
import { Application, Container, DEG_TO_RAD, Graphics } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window, antialias: true });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // create 4 boxes in a row
  const boxes = [];
  const wrapper = new Container();
  const size = 75;

  for (let i = 0; i < 4; i++) {
    const box = new Graphics()
      .roundRect(-size / 2, -size / 2, size, size, 8)
      .fill(0xed427c)
      .stroke({ color: 'white', width: 4 });

    box.filters = [
      new DropShadowFilter({
        color: 'black',
        alpha: 0.25,
        blur: 4,
        offset: { x: 0, y: 10 },
      }),
    ];

    box.x = i * 120;

    boxes.push(box);
    wrapper.addChild(box);
  }

  wrapper.x = (app.screen.width / 2) - (wrapper.width / 2) + (size / 2);
  wrapper.y = (app.screen.height / 2) - (wrapper.height / 2) + (size / 2);

  app.stage.addChild(wrapper);

  gsap.to(boxes, {
    keyframes: {
      y: [0, 80, -10, 30, 0],
      /**
       * ease across the entire set of keyframes
       * defaults to the one defined in the tween, or "none" if one isn't defined there)
       */
      ease: 'none',
      easeEach: 'power2.inOut', // <- ease between each keyframe (defaults to "power1.inOut")
    },
    rotation: 180 * DEG_TO_RAD,
    /** the "normal" part of the tween. In this case, it affects "rotate" because it's outside the keyframes */
    ease: 'elastic',
    duration: 5,
    stagger: 0.2,
    repeat: -1,
    yoyo: true,
  });
})();
