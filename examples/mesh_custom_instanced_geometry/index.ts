// description: This example demonstrates how to create and animate instanced geometry using custom shaders.
import { Application, Assets, Buffer, BufferUsage, Geometry, Mesh, Shader } from 'pixi.js';
import fragment from './instancedGeometry.frag';
import vertex from './instancedGeometry.vert';
import source from './instancedGeometry.wgsl';

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

  const spinnyBG = await Assets.load('https://pixijs.com/assets/bg_scene_rotate.jpg');

  const totalTriangles = 1000;

  // need a buffer big enough to store x, y of totalTriangles
  const instancePositionBuffer = new Buffer({
    data: new Float32Array(totalTriangles * 2),
    usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
  });

  const triangles = [];

  for (let i = 0; i < totalTriangles; i++) {
    triangles[i] = {
      x: 800 * Math.random(),
      y: 600 * Math.random(),
      speed: 1 + (Math.random() * 2),
    };
  }

  const geometry = new Geometry({
    attributes: {
      aPosition: [
        -10,
        -10, // x, y
        10,
        -20, // x, y
        10,
        10,
      ],
      aUV: [
        0,
        0, // u, v
        1,
        0, // u, v
        1,
        1,
        0,
        1,
      ],
      aPositionOffset: {
        buffer: instancePositionBuffer,
        instance: true,
      },
    },
    instanceCount: totalTriangles,
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
    resources: {
      uTexture: spinnyBG.source,
      uSampler: spinnyBG.source.style,
      waveUniforms: {
        time: { value: 1, type: 'f32' },
      },
    },
  });

  const triangleMesh = new Mesh({
    geometry,
    shader,
  });

  // triangle.position.set(128 / 2, 128 / 2);

  app.stage.addChild(triangleMesh);

  app.ticker.add(() => {
    const data = instancePositionBuffer.data;

    let count = 0;

    for (let i = 0; i < totalTriangles; i++) {
      const triangle = triangles[i];

      triangle.x += triangle.speed;
      triangle.x %= 800;

      data[count++] = triangle.x;
      data[count++] = triangle.y;
    }

    instancePositionBuffer.update();
  });
})();
