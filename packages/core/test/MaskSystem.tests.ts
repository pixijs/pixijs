import { COLOR_MASK_BITS, MASK_TYPES } from '@pixi/constants';
import {
    BaseTexture,
    CanvasResource,
    Filter,
    MaskData,
    Renderer,
    RenderTexture,
    SpriteMaskFilter,
    Texture,
} from '@pixi/core';
import { Container } from '@pixi/display';
import { Graphics } from '@pixi/graphics';
import { Matrix, Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';

import type {
    IFilterTarget,
    IMaskTarget,
} from '@pixi/core';

describe('MaskSystem', () =>
{
    function onePixelMask(worldTransform: Matrix | Record<string, number>): IMaskTarget
    {
        return {
            isFastRect() { return true; },
            worldTransform: worldTransform || Matrix.IDENTITY,
            getBounds() { return new Rectangle(0, 0, 1, 1); },
            render() { /* nothing*/ },
        } as unknown as IMaskTarget;
    }

    function createColorTexture(color: CanvasRenderingContext2D['fillStyle'])
    {
        const canvas = document.createElement('canvas');

        canvas.width = 16;
        canvas.height = 16;

        const context = canvas.getContext('2d');

        context.fillStyle = color;
        context.fillRect(0, 0, 16, 16);

        return new Texture(new BaseTexture(new CanvasResource(canvas)));
    }

    let renderer: Renderer;
    let textureRed: Texture;
    let textureGreen: Texture;
    let spriteMaskFilterGreen: SpriteMaskFilter;

    beforeAll(() =>
    {
        renderer = new Renderer();
        renderer.mask.enableScissor = true;
        textureRed = createColorTexture('#ff0000');
        textureGreen = createColorTexture('#00ff00');
        // Like SpriteMaskFilter, but with green instead of red channel
        spriteMaskFilterGreen = new SpriteMaskFilter(undefined, `\
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

    afterAll(() =>
    {
        renderer.destroy();
        renderer = null;
        textureRed.destroy(true);
        textureRed = null;
        textureGreen.destroy(true);
        textureGreen = null;
        spriteMaskFilterGreen.destroy();
        spriteMaskFilterGreen = null;
    });

    it('should have scissor-masks enabled', () =>
    {
        expect(renderer.mask.enableScissor).toEqual(true);
    });

    it('should use scissor masks with axis aligned squares', () =>
    {
        const context = {} as IMaskTarget;
        const maskObject = onePixelMask({ a: 1, b: 0, c: 0, d: 1 });
        const maskObject2 = onePixelMask({ a: 0, b: 1, c: 1, d: 0 });

        renderer.mask.push(context, maskObject);

        expect(renderer.scissor.getStackLength()).toEqual(1);

        renderer.mask.push(context, maskObject2);

        expect(renderer.scissor.getStackLength()).toEqual(2);

        renderer.mask.pop(context);

        expect(renderer.scissor.getStackLength()).toEqual(1);

        renderer.mask.pop(context);

        expect(renderer.scissor.getStackLength()).toEqual(0);
    });

    it('should return maskData to pool if it does not belong in the object', () =>
    {
        const context: IMaskTarget = {} as IMaskTarget;
        const maskObject = onePixelMask({ a: 1, b: 0, c: 0, d: 1 });

        renderer.mask['maskDataPool'].length = 0;
        renderer.mask.push(context, maskObject);
        renderer.mask.pop(context);

        const maskData = renderer.mask['maskDataPool'][0];

        expect(maskData).toBeDefined();
        expect(maskData._scissorCounter).toEqual(1);
    });

    it('should not put maskData to pool if it belongs to object', () =>
    {
        const context: IMaskTarget = {} as IMaskTarget;
        const maskData = new MaskData(onePixelMask({ a: 1, b: 0, c: 0, d: 1 }));

        renderer.mask['maskDataPool'].length = 0;

        for (let i = 0; i < 2; i++)
        {
            // repeat two times just to be sure
            renderer.mask.push(context, maskData);
            renderer.mask.pop(context);

            expect(maskData._scissorCounter).toEqual(1);
            expect(renderer.mask['maskDataPool'].length).toEqual(0);
        }
    });

    it('should not use scissor masks with non axis aligned squares', () =>
    {
        const context: IMaskTarget = {} as IMaskTarget;
        const maskObject = onePixelMask({ a: 0.1, b: 2, c: 2, d: -0.1 });

        renderer.mask.push(context, maskObject);

        expect(renderer.scissor.getStackLength()).toEqual(0);

        renderer.mask.pop(context);
    });

    it('should apply scissor with transform on canvas or renderTexture', () =>
    {
        const context: IMaskTarget = {} as IMaskTarget;
        const maskObject = {
            isFastRect() { return true; },
            worldTransform: Matrix.IDENTITY,
            getBounds() { return new Rectangle(2, 3, 6, 5); },
            render() { /* nothing*/ },
        } as unknown as IMaskTarget;

        renderer._view.resolution = 2;
        renderer.resize(30, 30);

        const rt = RenderTexture.create({ width: 20, height: 20, resolution: 3 });
        const scissor = jest.spyOn(renderer.gl, 'scissor');

        renderer.projection.transform = new Matrix(1, 0, 0, 1, 0.5, 1);
        renderer.mask.push(context, maskObject);
        renderer.mask.pop(context);

        // now , lets try it for renderTexture
        renderer.renderTexture.bind(rt);

        renderer.mask.push(context, maskObject);
        renderer.mask.pop(context);

        expect(scissor).toBeCalledTimes(2);
        // result Y is 2 because after transform y=8 h=10 and renderer H=60 is inverted , 8-18 becomes 52-42, e.g. Y=2
        expect(scissor.mock.calls[0]).toEqual([Math.round(5), Math.round(42), Math.round(12), Math.round(10)]);
        // resolution is 3 , and Y is not reversed
        expect(scissor.mock.calls[1]).toEqual([Math.round(7.5), Math.round(12), Math.round(18), Math.round(15)]);

        rt.destroy(true);

        renderer.projection.transform = null;
        renderer._view.resolution = 1;
    });

    // eslint-disable-next-line func-names
    it('should correctly calculate alpha mask area if filter is present', function ()
    {
        // fixes slow runs on CI #6604
        jest.setTimeout(5000);
        // the bug was fixed in #5444
        renderer.resize(10, 10);

        const filteredObject: IFilterTarget = {
            getBounds() { return new Rectangle(0, 0, 10, 10); },
            render() { /* nothing*/ },
        } as unknown as IFilterTarget;
        const maskBounds = new Rectangle(2, 3, 6, 5);
        const maskObject = {
            isSprite: true,
            _texture: Texture.WHITE,
            // @ts-expect-error - mocking IMaskTarget
            get texture() { return this._texture; },
            anchor: { x: 0, y: 0 },
            isFastRect() { return true; },
            worldTransform: Matrix.IDENTITY,
            getBounds() { return maskBounds.clone(); },
        } as unknown as IMaskTarget;
        const filters = [new Filter()];
        const maskSystem = renderer.mask;

        for (let i = 0; i < 6; i++)
        {
            renderer.filter.push(filteredObject, filters);
            maskSystem.push(filteredObject as IMaskTarget, maskObject);
            expect(maskSystem['maskStack'].length).toEqual(1);
            expect(maskSystem['maskStack'][0].type).toEqual(MASK_TYPES.SPRITE);
            expect(renderer.renderTexture.current).toBeDefined();

            const filterArea = renderer.renderTexture.current.filterFrame;
            const expected = maskBounds.clone().ceil();

            expected.fit(filteredObject.getBounds());
            expect(filterArea).toBeDefined();
            expect(filterArea.x).toEqual(expected.x);
            expect(filterArea.y).toEqual(expected.y);
            expect(filterArea.width).toEqual(expected.width);
            expect(filterArea.height).toEqual(expected.height);

            maskSystem.pop(filteredObject as IMaskTarget);
            renderer.filter.pop();
            expect(maskSystem['maskStack'].length).toEqual(0);
            expect(renderer.renderTexture.current).toBeNull();

            maskBounds.x += 1.0;
            maskBounds.y += 0.5;
        }
    });

    it('should render correctly without a custom sprite mask filter and a red texture sprite mask', () =>
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(textureRed));

        const renderTexture = renderer.generateTexture(graphics);

        graphics.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).toEqual(0xff);
        expect(g).toEqual(0xff);
        expect(b).toEqual(0xff);
        expect(a).toEqual(0xff);
    });

    it('should render correctly without a custom sprite mask filter and a green texture sprite mask', () =>
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(textureGreen));

        const renderTexture = renderer.generateTexture(graphics);

        graphics.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).toEqual(0x00);
        expect(g).toEqual(0x00);
        expect(b).toEqual(0x00);
        expect(a).toEqual(0x00);
    });

    it('should render correctly with acustom sprite mask filter and a red texture sprite mask', () =>
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(textureRed));
        graphics.mask.filter = spriteMaskFilterGreen;

        const renderTexture = renderer.generateTexture(graphics);

        graphics.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).toEqual(0x00);
        expect(g).toEqual(0x00);
        expect(b).toEqual(0x00);
        expect(a).toEqual(0x00);
    });

    it('should render correctly with a custom sprite mask filter and a green texture sprite mask', () =>
    {
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 1, 1).endFill();

        graphics.mask = new MaskData(new Sprite(textureGreen));
        graphics.mask.filter = spriteMaskFilterGreen;

        const renderTexture = renderer.generateTexture(graphics);

        graphics.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixel = new Uint8Array(4);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        renderTexture.destroy(true);

        const [r, g, b, a] = pixel;

        expect(r).toEqual(0xff);
        expect(g).toEqual(0xff);
        expect(b).toEqual(0xff);
        expect(a).toEqual(0xff);
    });

    it('should restore sprite of current sprite mask filter after pop', () =>
    {
        const renderTexture = RenderTexture.create({ width: 1, height: 1 });

        renderer.renderTexture.bind(renderTexture);

        const graphics1 = new Graphics();
        const graphics2 = new Graphics();

        const sprite1 = new Sprite(textureRed);
        const sprite2 = new Sprite(textureGreen);

        const maskData1 = new MaskData(sprite1);
        const maskData2 = new MaskData(sprite2);

        maskData1.filter = spriteMaskFilterGreen;
        maskData2.filter = spriteMaskFilterGreen;

        expect(maskData1.filter.maskSprite).toBeNull();
        expect(maskData2.filter.maskSprite).toBeNull();

        graphics1.mask = maskData1;
        graphics2.mask = maskData2;

        renderer.mask.push(graphics1, maskData1);

        expect(maskData1.filter.maskSprite).toEqual(sprite1);

        renderer.mask.push(graphics2, maskData2);

        expect(maskData2.filter.maskSprite).toEqual(sprite2);

        renderer.mask.pop(graphics2);

        expect(maskData1.filter.maskSprite).toEqual(sprite1);

        renderer.mask.pop(graphics1);

        expect(maskData1.filter.maskSprite).toBeNull();
        expect(maskData2.filter.maskSprite).toBeNull();

        renderTexture.destroy(true);
    });

    it('should render correctly with nested color and stencil masks', () =>
    {
        const stage = new Container();
        const container1 = new Container();
        const container2 = new Container();
        const graphics = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 2, 1).endFill();
        const mask = new Graphics().beginFill(0xffffff, 1.0).drawPolygon(1, 0, 2, 0, 2, 1, 1, 1).endFill();

        stage.addChild(container1, mask);
        container1.addChild(container2);
        container2.addChild(graphics);

        stage.mask = new MaskData();
        stage.mask.colorMask = COLOR_MASK_BITS.RED | COLOR_MASK_BITS.GREEN | COLOR_MASK_BITS.ALPHA;
        mask.mask = new MaskData();
        mask.mask.colorMask = COLOR_MASK_BITS.RED | COLOR_MASK_BITS.ALPHA;
        container1.mask = new MaskData(mask);
        container2.mask = new MaskData(mask);
        graphics.mask = new MaskData();
        graphics.mask.colorMask = COLOR_MASK_BITS.GREEN | COLOR_MASK_BITS.BLUE | COLOR_MASK_BITS.ALPHA;

        const renderTexture = renderer.generateTexture(stage, { region: new Rectangle(0, 0, 2, 1) });

        expect(renderTexture.width).toEqual(2);
        expect(renderTexture.height).toEqual(1);

        expect(stage.mask.type).toEqual(MASK_TYPES.COLOR);
        expect(container1.mask.type).toEqual(MASK_TYPES.STENCIL);
        expect(container2.mask.type).toEqual(MASK_TYPES.STENCIL);
        expect(graphics.mask.type).toEqual(MASK_TYPES.COLOR);
        expect(mask.mask.type).toEqual(MASK_TYPES.COLOR);

        stage.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixels = new Uint8Array(8);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 2, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        renderTexture.destroy(true);

        const [r1, g1, b1, a1, r2, g2, b2, a2] = pixels;

        // R   B A
        //   G B A
        // -------
        //   G   A

        expect(r1).toEqual(0x00);
        expect(g1).toEqual(0x00);
        expect(b1).toEqual(0x00);
        expect(a1).toEqual(0x00);
        expect(r2).toEqual(0x00);
        expect(g2).toEqual(0xff);
        expect(b2).toEqual(0x00);
        expect(a2).toEqual(0xff);
    });

    it('should render overlapping objects with color masks correctly', () =>
    {
        const stage = new Container();
        const graphics1 = new Graphics().beginFill(0xffffff, 1.0).drawRect(0, 0, 2, 1).endFill();
        const graphics2 = new Graphics().beginFill(0xffffff, 1.0).drawRect(1, 0, 2, 1).endFill();

        stage.addChild(graphics1, graphics2);

        stage.mask = new MaskData();
        stage.mask.colorMask = COLOR_MASK_BITS.RED | COLOR_MASK_BITS.GREEN | COLOR_MASK_BITS.ALPHA;
        graphics1.mask = new MaskData();
        graphics1.mask.colorMask = COLOR_MASK_BITS.RED | COLOR_MASK_BITS.BLUE | COLOR_MASK_BITS.ALPHA;
        graphics2.mask = new MaskData();
        graphics2.mask.colorMask = COLOR_MASK_BITS.GREEN | COLOR_MASK_BITS.BLUE | COLOR_MASK_BITS.ALPHA;

        const renderTexture = renderer.generateTexture(stage);

        expect(renderTexture.width).toEqual(3);
        expect(renderTexture.height).toEqual(1);

        expect(graphics1.mask.type).toEqual(MASK_TYPES.COLOR);
        expect(graphics2.mask.type).toEqual(MASK_TYPES.COLOR);

        stage.destroy(true);

        renderer.renderTexture.bind(renderTexture);

        const pixels = new Uint8Array(12);
        const gl = renderer.gl;

        gl.readPixels(0, 0, 3, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        renderTexture.destroy(true);

        const [r1, g1, b1, a1, r2, g2, b2, a2, r3, g3, b3, a3] = pixels;

        expect(r1).toEqual(0xff);
        expect(g1).toEqual(0x00);
        expect(b1).toEqual(0x00);
        expect(a1).toEqual(0xff);
        expect(r2).toEqual(0xff);
        expect(g2).toEqual(0xff);
        expect(b2).toEqual(0x00);
        expect(a2).toEqual(0xff);
        expect(r3).toEqual(0x00);
        expect(g3).toEqual(0xff);
        expect(b3).toEqual(0x00);
        expect(a3).toEqual(0xff);
    });
});
