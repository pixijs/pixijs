// description: This example demonstrates mouse interaction with a custom shader filter that blends based on mouse position
import { Application, Assets, Container, Filter, GlProgram, Point, Rectangle, Sprite } from 'pixi.js';
import fragment from './mouseBlending.frag';
import vertex from './mouseBlending.vert';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ preference: 'webgl', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the grass texture
  const texture = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  // Create background image
  const background = new Sprite(texture);

  background.width = app.screen.width;
  background.height = app.screen.height;
  app.stage.addChild(background);

  // NOTE: this shader wont work on old devices where mediump precision is forced in fragment shader
  // because v5 default vertex shader uses `inputSize` in it. Same uniform in fragment and vertex shader
  // cant have different precision :(

  const container = new Container();

  container.filterArea = new Rectangle(100, 100, app.screen.width - 200, app.screen.height - 200);
  app.stage.addChild(container);

  const filter = new Filter({
    glProgram: new GlProgram({ vertex, fragment }),
    resources: {
      localUniforms: {
        uMouse: { value: new Point(), type: 'vec2<f32>' },
      },
    },
  });

  container.filters = [filter];

  app.stage.hitArea = app.screen;
  app.stage.eventMode = 'static';
  app.stage.on('pointermove', (event) => {
    filter.resources.localUniforms.uniforms.uMouse.copyFrom(event.global);
  });
})();
