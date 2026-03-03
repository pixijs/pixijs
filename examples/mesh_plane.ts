// description: This example demonstrates how to use a MeshPlane to create a dynamic plane mesh, animated with vertex manipulation
import { Application, Assets, MeshPlane } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // Load the grass texture
  const texture = await Assets.load('https://pixijs.com/assets/bg_grass.jpg');

  // Create a simple grass plane and add it to the stage
  const plane = new MeshPlane({ texture, verticesX: 10, verticesY: 10 });

  plane.x = 100;
  plane.y = 100;

  app.stage.addChild(plane);

  // Get the buffer for vertex positions.
  const { buffer } = plane.geometry.getAttribute('aPosition');

  // Listen for animate update
  let timer = 0;

  app.ticker.add(() => {
    // Randomize the vertice positions a bit to create movement.
    for (let i = 0; i < buffer.data.length; i++) {
      buffer.data[i] += Math.sin((timer / 10) + i) * 0.5;
    }
    buffer.update();
    timer++;
  });
})();
