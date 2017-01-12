'use strict';

/* eslint-disable global-require */
require('../dist/pixi');

PIXI.utils.skipHello(); // hide banner

describe('PIXI', function ()
{
    it('should exist as a global object', function ()
    {
        expect(PIXI).to.be.an('object');
    });
    require('./core');
    require('./interaction');
    require('./loaders');
    require('./renders');
    require('./prepare');
});
