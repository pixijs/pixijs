// description: This example demonstrates how to create a custom mesh with colored triangle using custom shaders.
import { Application, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './triangleColor.frag';
import vertex from './triangleColor.vert';
import source from './triangleColor.wgsl';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    resizeTo: window,
    preference: 'webgpu',
  });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const geometry = new Geometry({
    attributes: {
      aPosition: [-100, -50, 100, -50, 0, 100],
      aColor: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    },
  });

  const gl = { vertex, fragment };

  const gpu = {
    vertex: {
      entryPoint: 'mainVert',
      source,
    },
    fragment: {
      entryPoint: 'mainFrag',
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
