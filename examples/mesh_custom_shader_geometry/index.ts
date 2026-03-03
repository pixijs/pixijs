// description: This example demonstrates how to create a custom mesh using PixiJS
import { Application, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './triangle.frag';
import vertex from './triangle.vert';
import source from './triangle.wgsl';

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

  const geometry = new Geometry({
    attributes: {
      aPosition: [-100, -50, 100, -50, 0, 100],
    },
  });

  // Webgl vertex and fragment shader source
  const gl = { vertex, fragment };

  // WebGPU vertex and fragment shader source
  // Here vertex and fragment shader sources are inferred from the same WGSL source
  const gpu = {
    vertex: {
      entryPoint: 'main',
      source,
    },
    fragment: {
      entryPoint: 'main',
      source,
    },
  };

  const shader = Shader.from({
    gl,
    gpu,
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
