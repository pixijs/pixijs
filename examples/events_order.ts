// description: This example demonstrates the order of pointer events (pointerenter, pointerleave, pointerover, pointerout) on nested interactive objects
import { Application, Graphics, Text } from 'pixi.js';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ antialias: true, background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  const title = app.stage.addChild(
    new Text({
      text: `Move your mouse slowly over the boxes to
        see the order of pointerenter, pointerleave,
        pointerover, pointerout events on each target!`,
      style: {
        fontSize: 16,
      },
    }),
  );

  title.x = 2;

  const logs = [];
  const logText = app.stage.addChild(
    new Text({
      text: '',
      style: {
        fontSize: 14,
      },
    }),
  );

  logText.y = 80;
  logText.x = 2;

  app.stage.name = 'stage';

  // Mount outer black box
  const blackBox = app.stage.addChild(new Graphics().rect(0, 0, 400, 400).fill({ color: 0 }));

  blackBox.name = 'black box';
  blackBox.x = 400;

  // Mount white box inside the white one
  const whiteBox = blackBox.addChild(new Graphics().rect(100, 100, 200, 200).fill({ color: 0xffffff }));

  whiteBox.name = 'white box';

  // Enable interactivity everywhere!
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  whiteBox.eventMode = 'static';
  blackBox.eventMode = 'static';

  function onEvent(e) {
    const type = e.type;
    const targetName = e.target.name;
    const currentTargetName = e.currentTarget.name;

    // Add event to top of logs
    logs.push(`${currentTargetName} received ${type} event (target is ${targetName})`);

    if (currentTargetName === 'stage' || type === 'pointerenter' || type === 'pointerleave') {
      logs.push('-----------------------------------------', '');
    }

    // Prevent logs from growing too long
    if (logs.length > 30) {
      while (logs.length > 30) {
        logs.shift();
      }
    }

    // Update logText
    logText.text = logs.join('\n');
  }

  [app.stage, whiteBox, blackBox].forEach((object) => {
    object.addEventListener('pointerenter', onEvent);
    object.addEventListener('pointerleave', onEvent);
    object.addEventListener('pointerover', onEvent);
    object.addEventListener('pointerout', onEvent);
  });
})();
