const { Renderer, MaskData } = require('../');
const { Rectangle } = require('@pixi/math');

describe('PIXI.systems.MaskSystem', function ()
{
    function onePixelMask(worldTransform)
    {
        return {
            isFastRect() { return true; },
            worldTransform: worldTransform || { a: 1, b: 0, c: 0, d: 1 },
            getBounds() { return new Rectangle(0, 0, 1, 1); },
            render() { /* nothing*/ },
        };
    }

    before(function ()
    {
        this.renderer = new Renderer();
        this.renderer.mask.enableScissor = true;
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
    });

    it('should have scissor-masks enabled', function ()
    {
        expect(this.renderer.mask.enableScissor).to.equal(true);
    });

    it('should detect wrong mask push/pop', function ()
    {
        const context = {};
        const context2 = {};
        const maskObject = onePixelMask();

        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.push(context2, maskObject);
        this.renderer.mask.pop(context, maskObject);
        this.renderer.mask.pop(context2, maskObject);

        expect(this.renderer.mask.errorCounter).to.equal(2);
    });

    it('should use scissor masks with axis aligned squares', function ()
    {
        const context = {};
        const maskObject = onePixelMask({ a: 1, b: 0, c: 0, d: 1 });
        const maskObject2 = onePixelMask({ a: 0, b: 1, c: 1, d: 0 });

        this.renderer.mask.push(context, maskObject);

        expect(this.renderer.scissor.getStackLength()).to.equal(1);

        this.renderer.mask.push(context, maskObject2);

        expect(this.renderer.scissor.getStackLength()).to.equal(2);

        this.renderer.mask.pop(context, maskObject2);

        expect(this.renderer.scissor.getStackLength()).to.equal(1);

        this.renderer.mask.pop(context, maskObject);

        expect(this.renderer.scissor.getStackLength()).to.equal(0);
    });

    it('should return maskData to pool if it does not belong in the object', function ()
    {
        const context = {};
        const maskObject = onePixelMask({ a: 1, b: 0, c: 0, d: 1 });

        this.renderer.mask.maskDataPool.length = 0;
        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.pop(context, maskObject);

        const maskData = this.renderer.mask.maskDataPool[0];

        expect(maskData).to.be.notnull;
        expect(maskData._scissorCounter).to.equal(1);
    });

    it('should not put maskData to pool if it belongs to object', function ()
    {
        const context = {};
        const maskData = new MaskData(onePixelMask({ a: 1, b: 0, c: 0, d: 1 }));

        this.renderer.mask.maskDataPool.length = 0;

        for (let i = 0; i < 2; i++)
        {
            // repeat two times just to be sure
            this.renderer.mask.push(context, maskData);
            this.renderer.mask.pop(context, maskData);

            expect(maskData._scissorCounter).to.equal(1);
            expect(this.renderer.mask.maskDataPool.length).to.equal(0);
        }
    });

    it('should not use scissor masks with non axis aligned sqares', function ()
    {
        const context = {};
        const maskObject = onePixelMask({ a: 0.1, b: 2, c: 2, d: -0.1 });

        this.renderer.mask.push(context, maskObject);

        expect(this.renderer.scissor.getStackLength()).to.equal(0);

        this.renderer.mask.pop(context, maskObject);
    });
});
