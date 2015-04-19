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
 * The property {@link PIXI.ticker.Ticker#autoStart} is set to true
 * for this instance.
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
