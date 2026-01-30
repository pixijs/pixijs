// description: This example demonstrates a multi-pass rendering technique using custom shaders and meshes.
import { Application, Assets, Container, Geometry, Mesh, RenderTexture, Shader } from 'pixi.js';
import combineFragment from './combine.frag';
import gridFragment from './grid.frag';
import vertex from './multipassMesh.vert';
import noiseFragment from './noise.frag';
import rippleFragment from './ripple.frag';
import waveFragment from './wave.frag';

(async () => {
  const app = new Application();

  await app.init({ height: 640, resizeTo: window, preference: 'webgl' });

  document.body.appendChild(app.view);

  // Build geometry.
  const geometry = new Geometry({
    attributes: {
      aPosition: [
        0,
        0, // x, y
        200,
        0, // x, y
        200,
        200, // x, y,
        0,
        200, // x, y,
      ],
      aUV: [0, 0, 1, 0, 1, 1, 0, 1],
    },
    indexBuffer: [0, 1, 2, 0, 2, 3],
  });

  // Load a perlinnoise texture for one of the shaders.
  const perlinTexture = await Assets.load('https://pixijs.com/assets/perlin.jpg');

  const gridShader = Shader.from({
    gl: {
      // Vertex shader. Use same shader for all passes.
      vertex,
      // First pass, generates a grid.
      fragment: gridFragment,
    },
    resources: {
      gridUniforms: {
        zoom: { type: 'f32', value: 10 },
      },
    },
  });

  // Sharing textures and meshes is possible.
  // But for simplicity each pass has its own output texture and mesh in this example.
  const gridTexture = RenderTexture.create({ width: 200, height: 200 });
  const gridQuad = new Mesh({ geometry, shader: gridShader });
  const gridContainer = new Container();

  gridContainer.addChild(gridQuad);

  const rippleShader = Shader.from({
    gl: {
      vertex,
      // Second pass. Takes grid as input and makes it ripple.
      fragment: rippleFragment,
    },
    resources: {
      rippleUniforms: {
        amount: { type: 'f32', value: 0.5 },
        phase: { type: 'f32', value: 0 },
      },
      texIn: gridTexture.source,
    },
  });

  const rippleTexture = RenderTexture.create({ width: 200, height: 200 });
  const rippleQuad = new Mesh({ geometry, shader: rippleShader });
  const rippleContainer = new Container();

  rippleContainer.addChild(rippleQuad);

  const noiseShader = Shader.from({
    gl: {
      vertex,
      // Second effect. Generates a filtered noise.
      fragment: noiseFragment,
    },
    resources: {
      noiseUniforms: {
        limit: { type: 'f32', value: 0.5 },
      },
      noise: perlinTexture.source,
    },
  });

  const noiseTexture = RenderTexture.create({ width: 200, height: 200 });
  const noiseQuad = new Mesh({ geometry, shader: noiseShader });
  const noiseContainer = new Container();

  noiseContainer.addChild(noiseQuad);

  const waveShader = Shader.from({
    gl: {
      vertex,
      // Third effect
      fragment: waveFragment,
    },
    resources: {
      waveUniforms: {
        amplitude: { type: 'f32', value: 0.75 },
        time: { type: 'f32', value: 0 },
      },
    },
  });

  const waveTexture = RenderTexture.create({ width: 200, height: 200 });
  const waveQuad = new Mesh(geometry, waveShader);
  const waveContainer = new Container();

  waveContainer.addChild(waveQuad);

  const combineShader = Shader.from({
    gl: {
      vertex,
      // Final combination pass
      fragment: combineFragment,
    },
    resources: {
      texRipple: rippleTexture.source,
      texNoise: noiseTexture.source,
      texWave: waveTexture.source,
    },
  });

  const combineQuad = new Mesh(geometry, combineShader);

  gridContainer.position.set(10, 10);
  rippleContainer.position.set(220, 10);
  noiseContainer.position.set(10, 220);
  waveContainer.position.set(10, 430);
  combineQuad.position.set(430, 220);

  // Add all phases to stage so all the phases can be seen separately.
  app.stage.addChild(gridContainer);
  app.stage.addChild(rippleContainer);
  app.stage.addChild(noiseContainer);
  app.stage.addChild(waveContainer);
  app.stage.addChild(combineQuad);

  // start the animation..
  let time = 0;

  app.ticker.add(() => {
    time += 1 / 60;
    gridQuad.shader.resources.gridUniforms.uniforms.zoom = (Math.sin(time) * 5) + 10;
    rippleQuad.shader.resources.rippleUniforms.phase = -time;
    waveQuad.shader.resources.waveUniforms.uniforms.time = time;
    noiseQuad.shader.resources.noiseUniforms.uniforms.limit = (Math.sin(time * 0.5) * 0.35) + 0.5;

    // Render the passes to get textures.
    app.renderer.render({
      container: gridQuad,
      target: gridTexture,
    });

    app.renderer.render({
      container: rippleQuad,
      target: rippleTexture,
    });

    app.renderer.render({
      container: noiseQuad,
      target: noiseTexture,
    });

    app.renderer.render({
      container: waveQuad,
      target: waveTexture,
    });
  });
})();
