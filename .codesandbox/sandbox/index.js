import * as PIXI from 'pixi.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ background: '0x1099bb', resizeTo: window, preference: 'webgl' });

    // do pixi things
    document.body.appendChild(app.canvas);

    // create a new Sprite from an image path
    const tex = await PIXI.Assets.load("https://pixijs.com/assets/bunny.png");
    const bunny = PIXI.Sprite.from(tex);

    // center the sprite's anchor point
    bunny.anchor.set(0.5);

    // move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((ticker) =>
    {
        // just for fun, let's rotate mr rabbit a little
        // delta is 1 if running at 100% performance
        // creates frame-independent transformation
        bunny.rotation += 0.1 * ticker.deltaTime;
    });
 })()

