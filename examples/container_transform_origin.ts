// description: This example demonstrates how to manipulate the origin and pivot of a container
import { Application, Container, Graphics, Point } from 'pixi.js';

(async () => {
  // Create the PIXI application
  const app = new Application();
  await app.init({ background: 0xffffff, resizeTo: window, antialias: true });
  document.body.appendChild(app.canvas);

  // Create grid background
  const grid = new Graphics();
  const gridSize = 50;
  for (let x = 0; x < window.innerWidth; x += gridSize) {
    grid.moveTo(x, 0).lineTo(x, window.innerHeight);
  }
  for (let y = 0; y < window.innerHeight; y += gridSize) {
    grid.moveTo(0, y).lineTo(window.innerWidth, y);
  }
  grid.stroke({ width: 1, color: 0xcccccc });
  app.stage.addChild(grid);

  // Container to demonstrate origin
  const container = new Container();
  app.stage.addChild(container);

  // Create a rectangle
  const rectWidth = 150;
  const rectHeight = 100;
  const rect = new Graphics().rect(0, 0, rectWidth, rectHeight).fill(0x3498db).stroke({ width: 4, color: 'black' });
  container.addChild(rect);

  // Crosshair to show origin
  const originMarker = new Graphics()
    .moveTo(-10, 0)
    .lineTo(10, 0)
    .moveTo(0, -10)
    .lineTo(0, 10)
    .stroke({ width: 4, color: 0xff0000 });
  container.addChild(originMarker);
  container.addChild(originMarker);

  // Position marker to show container position
  const positionMarker = new Graphics().circle(0, 0, 8).fill('red').circle(0, 0, 3)
    .fill(0xffffff);
  positionMarker.position.set(100);
  app.stage.addChild(positionMarker);

  // Position the container at center
  container.position.set(100);

  const origin = new Point(rectWidth / 2, rectHeight / 2);
  container.origin.copyFrom(origin);
  originMarker.position.copyFrom(origin);

  // Track current mode
  let useOrigin = true;

  // UI Sliders
  const uiContainer = document.createElement('div');
  uiContainer.style.position = 'fixed';
  uiContainer.style.top = '20px';
  uiContainer.style.right = '20px';
  uiContainer.style.padding = '10px';
  uiContainer.style.background = 'white';
  uiContainer.style.border = '1px solid #ccc';
  uiContainer.style.fontFamily = 'sans-serif';
  uiContainer.innerHTML = `
    <h3>Adjust Origin/Pivot</h3>
    <label><input type="checkbox" id="modeToggle" checked> Use Origin (unchecked = Pivot)</label><br><br>
    <label>X: <input type="range" min="0" max="${rectWidth}" step="5" value="${origin.x}" id="originX"></label><br>
    <label>Y: <input type="range" min="0" max="${rectHeight}" step="5" value="${origin.y}" id="originY"></label><br>
    <button id="resetOrigin">Reset</button>
  `;
  document.body.appendChild(uiContainer);

  // Event listeners
  const originXSlider = document.getElementById('originX') as HTMLInputElement;
  const originYSlider = document.getElementById('originY') as HTMLInputElement;
  const resetButton = document.getElementById('resetOrigin')!;
  const modeToggle = document.getElementById('modeToggle') as HTMLInputElement;

  function updateTransform() {
    if (useOrigin) {
      container.origin.copyFrom(origin);
      container.pivot.set(0, 0);
    } else {
      container.pivot.copyFrom(origin);
      container.origin.set(0, 0);
    }
    originMarker.position.copyFrom(origin);
  }

  modeToggle.addEventListener('change', () => {
    useOrigin = modeToggle.checked;
    container.rotation = 0;
    updateTransform();
  });

  originXSlider.addEventListener('change', () => {
    origin.x = parseFloat(originXSlider.value);
    container.rotation = 0;
    updateTransform();
  });

  originYSlider.addEventListener('change', () => {
    origin.y = parseFloat(originYSlider.value);
    container.rotation = 0;
    updateTransform();
  });

  resetButton.addEventListener('click', () => {
    origin.set(rectWidth / 2, rectHeight / 2);
    originXSlider.value = origin.x.toString();
    originYSlider.value = origin.y.toString();
    container.rotation = 0;
    updateTransform();
  });

  // Animation loop
  app.ticker.add((ticker) => {
    container.rotation += 0.01 * ticker.deltaTime;
  });
})();
