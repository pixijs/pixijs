// description: This example demonstrates how to create a perspective mesh that responds to mouse movement, simulating 3D rotation using PixiJS.
import { Application, Assets, PerspectiveMesh } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const texture = await Assets.load({
    src: 'https://pixijs.com/assets/eggHead.png',
  });

  const points = [
    { x: 0, y: 0 },
    { x: texture.width, y: 0 },
    { x: texture.width, y: texture.height },
    { x: 0, y: texture.height },
  ];

  const outPoints = points.map((p) => ({ ...p }));

  const mesh = app.stage.addChild(
    new PerspectiveMesh({
      texture,
      pivot: {
        x: texture.width / 2,
        y: texture.height / 2,
      },
      x: app.screen.width / 2,
      y: app.screen.height / 2,
      width: texture.width,
      height: texture.height,
    }),
  );

  mesh.scale = 2;

  let angleX = 0;
  let angleY = 0;

  // Function to apply 3D rotation to the points
  function rotate3D(points, outPoints, angleX, angleY, perspective) {
    const radX = (angleX * Math.PI) / 180;
    const radY = (angleY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    for (let i = 0; i < points.length; i++) {
      const src = points[i];
      const out = outPoints[i];
      const x = src.x - (texture.width / 2);
      const y = src.y - (texture.height / 2);
      let z = 0; // Assume initial z is 0 for this 2D plane

      // Rotate around Y axis
      const xY = (cosY * x) - (sinY * z);

      z = (sinY * x) + (cosY * z);

      // Rotate around X axis
      const yX = (cosX * y) - (sinX * z);

      z = (sinX * y) + (cosX * z);

      // Apply perspective projection
      const scale = perspective / (perspective - z);

      out.x = (xY * scale) + (texture.width / 2);
      out.y = (yX * scale) + (texture.height / 2);
    }
  }

  app.ticker.add(() => {
    rotate3D(points, outPoints, angleX, angleY, 300);
    mesh.setCorners(
      outPoints[0].x,
      outPoints[0].y,
      outPoints[1].x,
      outPoints[1].y,
      outPoints[2].x,
      outPoints[2].y,
      outPoints[3].x,
      outPoints[3].y,
    );
  });

  app.stage.hitArea = app.screen;
  app.stage.eventMode = 'static';
  app.stage.on('pointermove', (e) => {
    const { x, y } = e.global;

    angleY = -(x - mesh.x) / 10;
    angleX = -(y - mesh.y) / 10;
  });
})();
