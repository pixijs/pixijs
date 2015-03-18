// run the polyfills
require('./polyfill');

var extend = require('extend'),
    core = require('./core');

extend(core, require('./core/math'));
extend(core, require('./extras'));
extend(core, require('./mesh'));
extend(core, require('./filters'));
extend(core, require('./interaction'));
extend(core, require('./loaders'));
extend(core, require('./spine'));
extend(core, require('./text'));
extend(core, require('./deprecation'));

module.exports = core;
