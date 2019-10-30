const { MASK_TYPES } = require('@pixi/constants');
const { Rectangle, Matrix } = require('@pixi/math');
const { Renderer, MaskData, RenderTexture, Filter, Texture } = require('../');

describe('PIXI.systems.MaskSystem', function ()
{
    function onePixelMask(worldTransform)
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

    it('should not use scissor masks with non axis aligned squares', function ()
    {
        const context = {};
        const maskObject = onePixelMask({ a: 0.1, b: 2, c: 2, d: -0.1 });

        this.renderer.mask.push(context, maskObject);

        expect(this.renderer.scissor.getStackLength()).to.equal(0);

        this.renderer.mask.pop(context, maskObject);
    });

    it('should apply scissor with transform on canvas or renderTexture', function ()
    {
        const context = {};
        const maskObject =  {
            isFastRect() { return true; },
            worldTransform: Matrix.IDENTITY,
            getBounds() { return new Rectangle(2, 3, 6, 5); },
            render() { /* nothing*/ },
        };

        this.renderer.resolution = 2;
        this.renderer.resize(10, 10);

        const rt = RenderTexture.create({ width: 10, height: 10, resolution: 3 });
        const scissor = sinon.spy(this.renderer.gl, 'scissor');

        this.renderer.projection.transform = new Matrix(1, 0, 0, 1, 0.5, 1);
        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.pop(context, maskObject);

        // now , lets try it for renderTexture
        this.renderer.renderTexture.bind(rt);

        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.pop(context, maskObject);

        expect(scissor.calledTwice).to.be.true;
        // result Y is 2 because after transform y=8 h=10 and renderer H=20 is inverted , 8-18 becomes 12-2, e.g. Y=2
        expect(scissor.args[0]).to.eql([5, 2, 12, 10]);
        // resolution is 3 , and Y is not reversed
        expect(scissor.args[1]).to.eql([7.5, 12, 18, 15]);

        rt.destroy(true);
    });

    it('should correctly calculate alpha mask area if filter is present', function ()
    {
        // the bug was fixed in #5444
        this.renderer.resize(10, 10);

        const filteredObject = {
            getBounds() { return new Rectangle(0, 0, 10, 10); },
            render() { /* nothing*/ },
        };
        const maskBounds = new Rectangle(2, 3, 6, 5);
        const maskObject = {
            isSprite: true,
            _texture: Texture.WHITE,
            get texture() { return this._texture; },
            anchor: { x: 0, y: 0 },
            isFastRect() { return true; },
            worldTransform: Matrix.IDENTITY,
            getBounds() { return maskBounds.clone(); },
        };
        const filters = [new Filter()];
        const maskSystem = this.renderer.mask;

        for (let i = 0; i < 6; i++)
        {
            this.renderer.filter.push(filteredObject, filters);
            maskSystem.push(filteredObject, maskObject);
            expect(maskSystem.maskStack.length).to.equal(1);
            expect(maskSystem.maskStack[0].type).to.equal(MASK_TYPES.SPRITE);
            expect(this.renderer.renderTexture.current).to.be.notnull;

            const filterArea = this.renderer.renderTexture.current.filterFrame;
            const expected = maskBounds.clone();

            expected.fit(filteredObject.getBounds());
            expect(filterArea).to.be.notnull;
            expect(filterArea.x).to.equal(expected.x);
            expect(filterArea.y).to.equal(expected.y);
            expect(filterArea.width).to.equal(expected.width);
            expect(filterArea.height).to.equal(expected.height);

            maskSystem.pop(filteredObject);
            this.renderer.filter.pop();
            expect(maskSystem.maskStack.length).to.equal(0);
            expect(this.renderer.renderTexture.current).to.be.null;

            maskBounds.x += 1.0;
            maskBounds.y += 0.5;
        }
    });
});
