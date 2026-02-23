// description: This example demonstrates how to create and apply a custom shader filter
import { Application, Assets, Filter, GlProgram, Sprite } from 'pixi.js';
import fragment from './custom.frag';
import vertex from './custom.vert';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    hello: true,
    preference: 'webgl',
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the texture
  const texture = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  // Create background image
  const background = Sprite.from(texture);

  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // Create the new filter, arguments: (vertexShader, framentSource)
  const filter = new Filter({
    glProgram: new GlProgram({
      fragment,
      vertex,
    }),
    resources: {
      timeUniforms: {
        uTime: { value: 0.0, type: 'f32' },
      },
    },
  });

  // === WARNING ===
  // specify uniforms in filter constructor
  // or set them BEFORE first use
  // filter.uniforms.customUniform = 0.0

  // Add the filter
  background.filters = [filter];

  // Animate the filter
  app.ticker.add((ticker) => {
    filter.resources.timeUniforms.uniforms.uTime += 0.04 * ticker.deltaTime;
  });
})();
