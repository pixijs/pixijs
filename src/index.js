// run the polyfills
require('./polyfill');

var core = require('./core'),
    assign = Object.assign;

assign(core, require('./core/math'));
assign(core, require('./extras'));
assign(core, require('./mesh'));
assign(core, require('./filters'));
assign(core, require('./interaction'));
assign(core, require('./loaders'));
assign(core, require('./spine'));
assign(core, require('./text'));
assign(core, require('./deprecation'));

module.exports = core;
