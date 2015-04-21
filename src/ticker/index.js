/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/GoodBoyDigital/pixi.js/blob/master/LICENSE|MIT License}
 */
var Ticker = require('./Ticker');

/**
 * The shared ticker instance used by {@link PIXI.extras.MovieClip}.
 * and by {@link PIXI.interaction.InteractionManager}.
 * The property {@link PIXI.ticker.Ticker#autoStart} is set to `true`
 * for this instance. Please follow the example for how to opt-out
 * of auto-starting the shared ticker.
 * @example
 *     var ticker = PIXI.ticker.shared;
 *     // Set this to prevent starting this ticker when listeners are added.
 *     // By default this is true only for the PIXI.ticker.shared instance.
 *     ticker.autoStart = false;
 *     // FYI, call this to ensure the ticker is stopped. It should be stopped
 *     // if you have not attempted to render anything yet.
 *     ticker.stop();
 *     // Call this when you are ready for a running shared ticker.
 *     ticker.start();
 *
 * @example
 *     // You may also use the shared ticker to render.
 *     var renderer = PIXI.autoDetectRenderer(800, 600);
 *     var stage = new PIXI.Container();
 *     var interactionManager = PIXI.interaction.InteractionManager(renderer);
 *     document.body.appendChild(renderer.view);
 *     ticker.add(function () {
 *         renderer.render(stage);
 *     });
 *
 * @type {PIXI.ticker.Ticker}
 * @memberof PIXI.ticker
 */
var shared = new Ticker();
shared.autoStart = true;

module.exports = {
    shared: shared,
    Ticker: Ticker
};
