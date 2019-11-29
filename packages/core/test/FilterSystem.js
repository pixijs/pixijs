const { Renderer, Filter } = require('../');
const { Rectangle } = require('@pixi/math');
const path = require('path');

describe('PIXI.systems.FilterSystem', function ()
{
    before(function ()
    {
        this.renderer = new Renderer();
        this.resources = path.join(__dirname, 'resources');
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('measure() should skip filters setting an empty input frame', function ()
    {
        const filterStack = [
            new Filter(),
            new Filter(),
        ];

        filterStack[0].onMeasure = function ()
        {
            this._frame = new Rectangle();
            this._renderable = true;
        };

        const target = {
            getBounds() { return new Rectangle(0, 0, 512, 512); },
        };

        const pipe = this.renderer.filter.premeasure(target, filterStack);

        expect(pipe.filters.length).to.equal(1);
    });
});
