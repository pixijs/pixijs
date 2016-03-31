/**
 * @file        Main export of the PIXI extras library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.mesh
 */
module.exports = {
	ParticleContainer:           require('./ParticleContainer'),
    ParticleRenderer: 			 require('./webgl/ParticleRenderer')
};
