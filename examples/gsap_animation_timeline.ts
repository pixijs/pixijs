// description: This example demonstrates how to create a sequenced GSAP animation timeline with PixiJS, animating multiple boxes in a coordinated manner.
import { gsap } from 'gsap';
import { Application, Container, Graphics } from 'pixi.js';
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

  for (let i = 0; i < 3; i++) {
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

    box.y = i * 120;

    boxes.push(box);
    wrapper.addChild(box);
  }

  wrapper.x = (app.screen.width / 2) - (wrapper.width / 2) + (size / 2);
  wrapper.y = (app.screen.height / 2) - (wrapper.height / 2) + (size / 2);

  app.stage.addChild(wrapper);

  const tl = gsap.timeline({ delay: 2, repeat: -1, yoyo: true, repeatDelay: 1 });

  // sequenced one-after-the-other
  tl.to(boxes[0], { duration: 2, angle: -360 })
    .to(boxes[1], { duration: 1, x: -100, ease: 'elastic.out' })
    .to(boxes[2], { duration: 2, angle: 360, x: 100, ease: 'expo.out' });
})();
