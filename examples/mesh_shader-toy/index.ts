// description: This example demonstrates how to create a full-screen quad mesh with a ShaderToy-like shader using PixiJS.
import { Application, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './shaderToy.frag';
import vertex from './shaderToy.vert';

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

  const shader = Shader.from({
    gl: {
      vertex,
      fragment,
    },
    resources: {
      shaderToyUniforms: {
        iResolution: { value: [640, 360, 1], type: 'vec3<f32>' },
        iTime: { value: 0, type: 'f32' },
      },
    },
  });

  const quad = new Mesh({
    geometry: quadGeometry,
    shader,
  });

  quad.width = app.screen.width;
  quad.height = app.screen.height;
  quad.x = app.screen.width / 2;
  quad.y = app.screen.height / 2;

  app.stage.addChild(quad);

  app.ticker.add(() => {
    shader.resources.shaderToyUniforms.uniforms.iTime += app.ticker.elapsedMS / 1000;
  });
})();
