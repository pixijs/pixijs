const { CLEAR_MODES } = require('@pixi/constants');
const { Rectangle, Matrix } = require('@pixi/math');
const { Renderer, Filter } = require('../');

describe('PIXI.systems.FilterSystem', function ()
{
    function onePixelObject(worldTransform)
    {
        return {
            isFastRect() { return true; },
            worldTransform: worldTransform || Matrix.IDENTITY,
            getBounds() { return new Rectangle(0, 0, 1, 1); },
            render() { /* nothing*/ },
        };
    }

    before(function ()
    {
        this.renderer = new Renderer();
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should support clearMode', function ()
    {
        const innerFilter = new Filter();
        const filter = new Filter();
        const clearSpy = sinon.spy(this.renderer.framebuffer, 'clear');
        const obj = onePixelObject();
        const filterSystem = this.renderer.filter;

        let clearModeValue = CLEAR_MODES.BLEND;

        filter.apply = (filterSystem, input, output, clearMode) =>
        {
            const tmp = filterSystem.getFilterTexture(input);

            innerFilter.apply(filterSystem, input, tmp, clearModeValue);
            innerFilter.apply(filterSystem, tmp, output, clearMode);
            filterSystem.returnFilterTexture(tmp);
        };

        let prevCalls = 0;

        function render(clearMode, forceClear)
        {
            clearModeValue = clearMode;
            filterSystem.forceClear = forceClear;
            filterSystem.push(obj, [filter]);
            filterSystem.pop();

            const val = clearSpy.callCount;
            const clears = val - prevCalls - 1;

            prevCalls = val;

            return clears;
        }

        expect(render(CLEAR_MODES.BLEND, false)).to.equal(0);
        expect(render(CLEAR_MODES.BLEND, true)).to.equal(0);
        expect(render(CLEAR_MODES.CLEAR, false)).to.equal(1);
        expect(render(CLEAR_MODES.CLEAR, true)).to.equal(1);
        expect(render(CLEAR_MODES.AUTO, false)).to.equal(0);
        expect(render(CLEAR_MODES.AUTO, true)).to.equal(1);
        expect(render(false, false)).to.equal(0);
        expect(render(false, true)).to.equal(0);
        expect(render(true, false)).to.equal(1);
        expect(render(true, true)).to.equal(1);

        // check that there are two temp textures of same size
        const keys = Object.keys(filterSystem.texturePool.texturePool);

        expect(keys.sort()).to.deep.eql(['65537', 'screen']);
        expect(filterSystem.texturePool.texturePool[65537].length).to.equal(2);
    });
});
