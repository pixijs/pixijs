import extras from './extras';
import filters from './filters';
import interaction from './interaction';
import loaders from './loaders';
import mesh from './mesh';
import particles from './particles';
import accessibility from './accessibility';
import extract from './extract';
import prepare from './prepare';
import core from './core';

// run the polyfills
require('./polyfill');

/**
 * A premade instance of the loader that can be used to loader resources.
 *
 * @name loader
 * @memberof PIXI
 * @property {PIXI.loaders.Loader}
 */
const loader = new loaders.Loader();

// add core plugins
module.exports = Object.assign(core, {
    accessibility,
    extract,
    extras,
    filters,
    interaction,
    loaders,
    loader,
    mesh,
    particles,
    prepare
});

// Mixin the deprecations
require('./deprecation');

// Always export pixi globally.
global.PIXI = core;