// description: This example demonstrates how to create a GSAP animation with PixiJS, featuring particles that animate with physics.
// original: https://codepen.io/natewiley/pen/VegBax
import { gsap } from 'gsap';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import PixiPlugin from 'gsap/PixiPlugin';
import { Application, Container, Graphics } from 'pixi.js';

gsap.registerPlugin(Physics2DPlugin, PixiPlugin);
(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: 'black', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const particleCount = 160; // Similar to original example's element count
  const particles = [];

  // Create container to hold all particles
  const wrapper = new Container();
  app.stage.addChild(wrapper);
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const size = random(5, 40);

    // Create particle with border using Graphics
    const particle = new Container();
    const graphics = new Graphics()
      .circle(0, 0, size)
      .fill({ color: 0x000000, alpha: 0 })
      .stroke({
        color: `hsl(${(i * (300 / particleCount)) - 5}, 100%, 50%)`,
        width: 2,
      });
    particle.addChild(graphics);

    // Set initial position
    particle.x = (i * (100 / particleCount) * app.screen.width) / 100;
    particle.y = app.screen.height + 10;
    wrapper.addChild(particle);
    particles.push(particle);

    // Animate each particle
    gsap.to(particle, {
      physics2D: {
        velocity: random(100, 300),
        gravity: 100,
        angle: random(-80, -100),
      },
      pixi: { scaleX: 0.1, scaleY: 0.1 },
      alpha: 0,
      duration: random(2, 6),
      ease: 'power1.out',
      repeat: -1,
      delay: i * -0.2,
      onComplete: () => {
        // Reset particle position when animation completes
        particle.x = (i * (100 / particleCount) * app.screen.width) / 100;
        particle.y = app.screen.height + 10;
        particle.scale.set(1);
        particle.alpha = 1;
      },
    });
  }
})();
function random(min, max) {
  return (Math.random() * (max - min)) + min;
}
