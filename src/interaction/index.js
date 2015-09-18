/**
 * @file        Main export of the PIXI interactions library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.interaction
 */
module.exports = {
    InteractionData:    require('./InteractionData'),
    InteractionManager: require('./InteractionManager'),
    interactiveTarget:  require('./interactiveTarget')
};
