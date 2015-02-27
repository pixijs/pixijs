var core = require('./core'),
	math = core.math,
	// plugins:
	extras         = require('./extras'),
	filters        = require('./filters'),
	interaction    = require('./interaction'),
	loaders        = require('./loaders'),
	spine          = require('./spine'),
	text           = require('./text'),
    deprecation    = require('./deprecation');

var modules = [];

modules.push(math);
modules.push(extras);
modules.push(filters);
modules.push(interaction);
modules.push(loaders);
modules.push(spine);
modules.push(text);

for (var i = 0; i < modules.length; i++) {

	// Adds the module to the core, so you can do
	// PIXI.Text instead of PIXI.text.Text
	bundleUp(core,modules[i]);
};

function bundleUp(object1,object2){

    for(var keys in object2){
        object1[keys] = object2[keys];
    }
}

module.exports = core;
