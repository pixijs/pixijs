// description: This example demonstrates how to create a simple GSAP animation with PixiJS, featuring text elements that animate in a staggered fashion.
import { gsap } from 'gsap';
import { Application, Assets, Container, Graphics, Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });
  await Assets.load('https://pixijs.com/assets/webfont-loader/Grandstander-ExtraBold.ttf');

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // create several text words
  const words = ['PixiJS', '&', 'GSAP', '💚'];
  let spacing = 0;
  const wrapper = new Container();

  wrapper.x = app.screen.width / 2;
  wrapper.y = app.screen.height / 2;

  const texts = words.map((word) => {
    const wordContainer = new Container();

    // Create text
    const text = new Text({
      text: word,
      style: {
        fontFamily: 'Grandstander ExtraBold',
        fontSize: 36,
        fill: 0xffffff,
      },
    });

    // Add padding for the box
    const padding = 20;

    // Create rounded rectangle
    const box = new Graphics()
      .roundRect(-padding / 2, -padding / 2, text.width + padding, text.height + padding, 8)
      .fill({ color: 0xed427c })
      .stroke({ color: 'white', width: 2 });

    box.filters = [
      new DropShadowFilter({
        color: 'black',
        alpha: 0.25,
        blur: 4,
        offset: { x: 0, y: 10 },
      }),
    ];

    // Add box and text to container
    wordContainer.addChild(box, text);
    // wordContainer.cacheAsTexture(true);

    // Set pivot point to center of word
    wordContainer.pivot.set(text.width / 2, text.height / 2);

    // Adjust position to account for pivot
    wordContainer.x = spacing + (text.width / 2);
    spacing += wordContainer.width + 10; // Add spacing between words
    wrapper.addChild(wordContainer);

    return wordContainer;
  });

  wrapper.pivot.x = spacing / 2; // Center the wrapper
  app.stage.addChild(wrapper);

  gsap.from(texts, {
    y: -100,
    alpha: 0,
    angle: 'random(-80, 80)',
    stagger: 0.1,
    duration: 1,
    ease: 'back',
    yoyo: true,
    repeat: -1,
    repeatDelay: 1,
  });
})();
