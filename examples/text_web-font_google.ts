// description: This example demonstrates how to load and use a custom web font text rendering.
import { Application, Text } from 'pixi.js';

// Load them google fonts before starting...
(window as any).WebFontConfig = {
  google: {
    families: ['Snippet'],
  },
  active() {
    init();
  },
};

// include the web-font loader script
(function () {
  const wf = document.createElement('script');
  wf.src = `${
    document.location.protocol === 'https:' ? 'https' : 'http'
  }://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js`;
  wf.type = 'text/javascript';
  wf.async = true;
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(wf, s);
})();
/* eslint-enabled */

async function init() {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.body.appendChild(app.canvas);

  // create some white text using the Snippet webfont
  const textSample = new Text('PixiJS text using the\ncustom "Snippet" Webfont', {
    fontFamily: 'Snippet',
    fontSize: 50,
    fill: 'white',
    align: 'left',
  });
  textSample.position.set(50, 200);
  app.stage.addChild(textSample);
}
