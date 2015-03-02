var core        = require('./core'),
    deprecation = require('./deprecation');

// plugins:
core.extras         = require('./extras');
core.filters        = require('./filters');
core.interaction    = require('./interaction');
core.loaders        = require('./loaders');
core.spine          = require('./spine');
core.text           = require('./text');

module.exports = core;
