// run the polyfills
require('./polyfill');

var core = module.exports = require('./core');

// add core plugins.
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
core.mesh           = require('./mesh');
core.ticker         = require('./ticker');

// export a premade loader instance
core.loader = new core.loaders.Loader();

// mixin the deprecation features.
Object.assign(core, require('./deprecation'));

// Always export pixi globally.
global.PIXI = core;
