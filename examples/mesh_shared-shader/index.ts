// description: This example demonstrates how to use shared shaders across multiple meshes using PixiJS.
import { Application, Assets, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './sharedShader.frag';
import vertex from './sharedShader.vert';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    preference: 'webgl',
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const quadGeometry = new Geometry({
    attributes: {
      aPosition: [
        -100,
        -100, // x, y
        100,
        -100, // x, y
        100,
        100, // x, y,
        -100,
        100, // x, y,
      ],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1],
    },
    indexBuffer: [0, 1, 2, 0, 2, 3],
  });

  const geometry = new Geometry({
    attributes: {
      aPosition: [
        -100,
        -100, // x, y
        100,
        -100, // x, y
        100,
        100, // x, y,
      ],
      aUV: [0, 0, 1, 0, 1, 1],
    },
  });

  const shader = Shader.from({
    gl: {
      vertex,
      fragment,
    },
    resources: {
      uTexture: (await Assets.load('https://pixijs.com/assets/bg_rotate.jpg')).source,
    },
  });

  const quad = new Mesh({
    geometry: quadGeometry,
    shader,
  });

  const triangle = new Mesh({
    geometry,
    shader,
  });

  quad.position.set(400, 300);
  triangle.position.set(400, 300);
  triangle.scale.set(2);

  app.stage.addChild(quad, triangle);

  app.ticker.add(() => {
    triangle.rotation += 0.01;
    quad.rotation -= 0.01;
  });
})();
