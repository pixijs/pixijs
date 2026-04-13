// description: This example demonstrates SplitText with style reactivity and character-level animation.
import { gsap } from 'gsap';
import { Application, Container, SplitText } from 'pixi.js';

(async () => {
  const app = new Application();

  await app.init({ background: '#1a1a2e', resizeTo: window, antialias: true });
  document.body.appendChild(app.canvas);

  const scene = new Container();
  scene.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(scene);

  const splitText = new SplitText({
    text: 'PixiJS SplitText',
    style: {
      fontFamily: 'Arial',
      fontSize: 64,
      fontWeight: 'bold',
      fill: 'white',
    },
  });

  splitText.x = -splitText.width / 2;
  splitText.y = -splitText.height / 2;
  scene.addChild(splitText);

  // Animate each character with a wave effect
  function playAnimation() {
    gsap.fromTo(
      splitText.chars,
      {
        y: 0,
        rotation: 0,
        alpha: 0,
        scale: 0,
      },
      {
        y: 0,
        rotation: Math.PI * 2,
        alpha: 1,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.7)',
        stagger: 0.05,
        onComplete: () => {
          // After the intro, run a continuous wave
          gsap.to(splitText.chars, {
            y: -20,
            duration: 0.4,
            ease: 'sine.inOut',
            stagger: {
              each: 0.08,
              repeat: -1,
              yoyo: true,
            },
          });
        },
      },
    );
  }

  playAnimation();
})();
