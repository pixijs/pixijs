import { MASK_TYPES, MSAA_QUALITY } from '@pixi/constants';
import { Rectangle, Matrix } from '@pixi/math';
import { Renderer, MaskData, RenderTexture, Filter, Texture, BaseTexture, CanvasResource,
    SpriteMaskFilter } from '@pixi/core';
import { Graphics } from '@pixi/graphics';
import { Sprite } from '@pixi/sprite';
import sinon from 'sinon';
import { expect } from 'chai';

describe('MaskSystem', function ()
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

    function createColorTexture(color)
    {
        const canvas = document.createElement('canvas');

        canvas.width = 16;
        canvas.height = 16;

        const context = canvas.getContext('2d');

        context.fillStyle = color;
        context.fillRect(0, 0, 16, 16);

        return new Texture(new BaseTexture(new CanvasResource(canvas)));
    }

    before(function ()
    {
        this.renderer = new Renderer();
        this.renderer.mask.enableScissor = true;
        this.textureRed = createColorTexture('#ff0000');
        this.textureGreen = createColorTexture('#00ff00');
        // Like SpriteMaskFilter, but with green instead of red channel
        this.spriteMaskFilterGreen = new SpriteMaskFilter(undefined, `\
            varying vec2 vMaskCoord;
            varying vec2 vTextureCoord;

            uniform sampler2D uSampler;
            uniform sampler2D mask;
            uniform float alpha;
            uniform float npmAlpha;
            uniform vec4 maskClamp;

            void main(void)
            {
                float clip = step(3.5,
                    step(maskClamp.x, vMaskCoord.x) +
                    step(maskClamp.y, vMaskCoord.y) +
                    step(vMaskCoord.x, maskClamp.z) +
                    step(vMaskCoord.y, maskClamp.w));

                vec4 original = texture2D(uSampler, vTextureCoord);
                vec4 masky = texture2D(mask, vMaskCoord);
                float alphaMul = 1.0 - npmAlpha * (1.0 - masky.a);

                original *= (alphaMul * masky.g * alpha * clip);

                gl_FragColor = original;
            }`);
    });

    after(function ()
    {
        this.renderer.destroy();
        this.renderer = null;
        this.textureRed.destroy(true);
        this.textureRed = null;
        this.textureGreen.destroy(true);
        this.textureGreen = null;
        this.spriteMaskFilterGreen.destroy();
        this.spriteMaskFilterGreen = null;
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

        expect(maskData).to.exist;
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
        this.renderer.resize(30, 30);

        const rt = RenderTexture.create({ width: 20, height: 20, resolution: 3 });
        const scissor = sinon.spy(this.renderer.gl, 'scissor');

        this.renderer.projection.transform = new Matrix(1, 0, 0, 1, 0.5, 1);
        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.pop(context, maskObject);

        // now , lets try it for renderTexture
        this.renderer.renderTexture.bind(rt);

        this.renderer.mask.push(context, maskObject);
        this.renderer.mask.pop(context, maskObject);

        expect(scissor.calledTwice).to.be.true;
        // result Y is 2 because after transform y=8 h=10 and renderer H=60 is inverted , 8-18 becomes 52-42, e.g. Y=2
        expect(scissor.args[0]).to.eql([Math.round(5), Math.round(42), Math.round(12), Math.round(10)]);
        // resolution is 3 , and Y is not reversed
        expect(scissor.args[1]).to.eql([Math.round(7.5), Math.round(12), Math.round(18), Math.round(15)]);

        rt.destroy(true);
        this.renderer.projection.transform = null;
        this.renderer.resolution = 1;
    });

    it('should correctly calculate alpha mask area if filter is present', function ()
    {
        // fixes slow runs on CI #6604
        this.timeout(5000);
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
            expect(this.renderer.renderTexture.current).to.exist;

            const filterArea = this.renderer.renderTexture.current.filterFrame;
            const expected = maskBounds.clone().ceil();

            expected.fit(filteredObject.getBounds());
            expect(filterArea).to.exist;
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

    it('should render correctly without a custom sprite mask filter and a red texture sprite mask', function ()
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(this.textureRed));

        const renderTexture = this.renderer.generateTexture(graphics);

        graphics.destroy(true);

        this.renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = this.renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).to.equal(0xff);
        expect(g).to.equal(0xff);
        expect(b).to.equal(0xff);
        expect(a).to.equal(0xff);
    });

    it('should render correctly without a custom sprite mask filter and a green texture sprite mask', function ()
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(this.textureGreen));

        const renderTexture = this.renderer.generateTexture(graphics);

        graphics.destroy(true);

        this.renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = this.renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).to.equal(0x00);
        expect(g).to.equal(0x00);
        expect(b).to.equal(0x00);
        expect(a).to.equal(0x00);
    });

    it('should render correctly with acustom sprite mask filter and a red texture sprite mask', function ()
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(this.textureRed));
        graphics.mask.filter = this.spriteMaskFilterGreen;

        const renderTexture = this.renderer.generateTexture(graphics);

        graphics.destroy(true);

        this.renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = this.renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).to.equal(0x00);
        expect(g).to.equal(0x00);
        expect(b).to.equal(0x00);
        expect(a).to.equal(0x00);
    });

    it('should render correctly with a custom sprite mask filter and a green texture sprite mask', function ()
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(this.textureGreen));
        graphics.mask.filter = this.spriteMaskFilterGreen;

        const renderTexture = this.renderer.generateTexture(graphics);

        graphics.destroy(true);

        this.renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = this.renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).to.equal(0xff);
        expect(g).to.equal(0xff);
        expect(b).to.equal(0xff);
        expect(a).to.equal(0xff);
    });

    it('should restore sprite of current sprite mask filter after pop', function ()
    {
        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        this.renderer.renderTexture.bind(renderTexture);

        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        const sprite1 = new Sprite(this.textureRed);
        const sprite2 = new Sprite(this.textureGreen);

        const maskData1 = new MaskData(sprite1);
        const maskData2 = new MaskData(sprite2);

        maskData1.filter = this.spriteMaskFilterGreen;
        maskData2.filter = this.spriteMaskFilterGreen;

        expect(maskData1.filter.maskSprite).to.be.null;
        expect(maskData2.filter.maskSprite).to.be.null;

        graphics1.mask = maskData1;
        graphics2.mask = maskData2;

        this.renderer.mask.push(graphics1, maskData1);

        expect(maskData1.filter.maskSprite).to.equal(sprite1);

        this.renderer.mask.push(graphics2, maskData2);

        expect(maskData2.filter.maskSprite).to.equal(sprite2);

        this.renderer.mask.pop(graphics2);

        expect(maskData1.filter.maskSprite).to.equal(sprite1);

        this.renderer.mask.pop(graphics1);

        expect(maskData1.filter.maskSprite).to.be.null;
        expect(maskData2.filter.maskSprite).to.be.null;

        renderTexture.destroy(true);
    });
});
