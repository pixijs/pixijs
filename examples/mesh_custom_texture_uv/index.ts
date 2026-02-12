// description: This example demonstrates how to create a textured custom mesh using PixiJS.
import { Application, Assets, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './triangleTextured.frag';
import vertex from './triangleTextured.vert';

(async () => {
  const texture = await Assets.load('https://pixijs.com/assets/bg_scene_rotate.jpg');

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    preference: 'webgl',
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const geometry = new Geometry({
    attributes: {
      aPosition: [
        -100,
        -100, // x, y
        100,
        -100, // x, y
        100,
        100,
      ], // x, y,,
      aColor: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      aUV: [0, 0, 1, 0, 1, 1],
    },
  });

  const shader = Shader.from({
    gl: {
      vertex,
      fragment,
    },
    resources: {
      uTexture: texture.source,
    },
  });

  const triangle = new Mesh({
    geometry,
    shader,
  });

  triangle.position.set(400, 300);

  app.stage.addChild(triangle);

  app.ticker.add(() => {
    triangle.rotation += 0.01;
  });
})();
