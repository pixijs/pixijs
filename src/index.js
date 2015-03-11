var core = require('./core');

extendCore(require('./core/math'));
extendCore(require('./extras'));
extendCore(require('./mesh'));
extendCore(require('./filters'));
extendCore(require('./interaction'));
extendCore(require('./loaders'));
extendCore(require('./spine'));
extendCore(require('./text'));
extendCore(require('./deprecation'));

function extendCore(obj)
{
    for(var key in obj)
    {
        core[key] = obj[key];
    }
}

module.exports = core;
