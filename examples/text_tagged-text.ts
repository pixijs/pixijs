// description: This example demonstrates how to use tagged text to style individual parts of a text string.
import { Application, Text } from 'pixi.js';

(async () => {
  const app = new Application();

  await app.init({ background: '#1a1a2e', resizeTo: window, antialias: true });
  document.body.appendChild(app.canvas);

  const text = new Text({
    text: '<bold>PixiJS v8.16</bold> ships with <highlight>tagged text</highlight>, letting you apply <italic>per-word styling</italic> using simple <bold><highlight>inline tags</highlight></bold>.',
    style: {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: '#e0e0e0',
      wordWrap: true,
      wordWrapWidth: app.screen.width - 80,
      lineHeight: 42,
      tagStyles: {
        bold: {
          fontWeight: 'bold',
          fill: 'white',
        },
        highlight: {
          fill: '#00d4ff',
          fontSize: 30,
        },
        italic: {
          fontStyle: 'italic',
          fill: '#ffd700',
        },
      },
    },
  });

  text.x = 40;
  text.y = (app.screen.height / 2) - (text.height / 2);
  app.stage.addChild(text);
})();
