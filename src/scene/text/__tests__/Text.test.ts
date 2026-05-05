import { Container } from '../../container/Container';
import { Sprite } from '../../sprite/Sprite';
import { BitmapText } from '../../text-bitmap/BitmapText';
import { CanvasTextMetrics } from '../canvas/CanvasTextMetrics';
import { Text } from '../Text';
import { TextStyle } from '../TextStyle';
import '../../graphics/init';
import '../../text-bitmap/init';
import '../init';
import { getWebGLRenderer } from '@test-utils';
import { Point } from '~/maths';
import { TextureSource } from '~/rendering/renderers/shared/texture/sources/TextureSource';

import type { DestroyOptions } from '../../container/destroyTypes';

describe('Text', () =>
{
    describe('properties', () =>
    {
        it('should be able to modify the size', () =>
        {
            const text = new Text({ text: 'foo' });

            text.width = 200;
            text.height = 300;

            expect(Math.round(text.width)).toEqual(200);
            expect(Math.round(text.height)).toEqual(300);
        });

        it('should measure width of text correctly after changing text value', () =>
        {
            const text = new Text({ text: '' });

            expect(text.width).toEqual(0);

            text.text = 'hello';

            expect(Math.round(text.width)).toEqual(55);
        });

        it('should set the text resolution to match the resolution provided', () =>
        {
            const text = new Text({ text: 'foo', resolution: 3 });

            expect(text.resolution).toEqual(3);
        });

        it('should update the text resolution to match the renderer resolution when being rendered to screen', async () =>
        {
            const text = new Text({ text: 'foo' });

            const renderer = await getWebGLRenderer({ resolution: 2 });

            renderer.renderPipes.text['_updateGpuText'](text);

            const texture = text._gpuData[renderer.uid].texture;

            expect(texture.source.resolution).toEqual(2); // <-- getting null

            renderer.destroy();
        });

        it('should use any manually set text resolution over the renderer resolution', async () =>
        {
            const text = new Text({ text: 'foo', resolution: 3 });

            expect(text.resolution).toEqual(3);

            const renderer = await getWebGLRenderer({ resolution: 2 });

            const texture = renderer.canvasText.getTexture(text);

            expect(texture.source.resolution).toEqual(3);

            renderer.destroy();
        });

        it('should handle resolution changes after text destruction', async () =>
        {
            const text = new Text({ text: 'foo' });

            const renderer = await getWebGLRenderer();

            renderer.render(text);

            text.destroy();

            expect(() => { renderer.resolution = 3; }).not.toThrow();

            renderer.destroy();
        });
    });

    describe('destroy', () =>
    {
        it('should call through to Sprite.destroy', () =>
        {
            const text = new Text({ text: 'foo' });

            expect(text.anchor).not.toEqual(null);
            text.destroy();
            expect(text.anchor).toEqual(null);
        });

        it('should set context to null', () =>
        {
            const text = new Text({ text: 'foo' });

            expect(text.style).not.toEqual(null);
            text.destroy();
            expect(text.style).toEqual(null);
        });

        it('should destroy children if children flag is set', () =>
        {
            const text = new Text({ text: 'foo' });
            const child = new Sprite();

            text.addChild(child);
            text.destroy({ children: true });
            expect(text.destroyed).toEqual(true);
            expect(child.destroyed).toEqual(true);
        });

        it('should accept options correctly', () =>
        {
            const text = new Text({ text: 'foo' });
            const child = new Sprite();

            text.addChild(child);
            text.destroy(true);
            expect(text.destroyed).toEqual(true);
            expect(child.destroyed).toEqual(true);
        });

        it('should pass opts on to children if children flag is set', () =>
        {
            const text = new Text({ text: 'foo' });
            const child = new Sprite();
            let childDestroyOpts: DestroyOptions | boolean;

            child.destroy = (opts) =>
            {
                childDestroyOpts = opts;
            };

            text.addChild(child);
            text.destroy({ children: true, texture: true });
            expect(childDestroyOpts).toEqual({ children: true, texture: true });
        });

        it('should destroy canvas text correctly on the pipes and systems', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const text = new Text({ text: 'foo' });

            container.addChild(text);
            renderer.render({ container });

            const key = text.styleKey;

            expect(renderer.canvasText['_activeTextures'][key].usageCount).toBe(1);

            text.destroy();

            expect(text._gpuData).toBeEmptyObject();
            expect(renderer.canvasText['_activeTextures'][key]).toBeNull();
        });

        it('should destroy bitmap text correctly on the pipes and systems', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const text = new BitmapText({ text: 'foo' });

            container.addChild(text);

            renderer.render({ container });

            expect(text._gpuData).not.toBeNull();

            text.destroy();

            expect(text._gpuData).toBeEmptyObject();
        });

        it('should destroy textStyle correctly', () =>
        {
            const style = new TextStyle({ fill: 'red' });

            const text = new Text({ text: 'foo', style });

            expect(text.style.fill).toBe('red');

            text.destroy();

            expect(style.fill).toBe('red');

            const text2 = new Text({ text: 'foo', style });

            expect(text2.style.fill).toBe('red');

            text2.destroy(true);

            expect(style.fill).toBe(null);
        });
    });

    describe('text', () =>
    {
        it('should convert numbers into strings', () =>
        {
            const text = new Text({ text: 2 });

            expect(text.text).toEqual('2');
        });

        it('should not change 0 to \'\'', () =>
        {
            const text = new Text({ text: 0 });

            expect(text.text).toEqual('0');
        });

        it('should prevent setting null via text options', () =>
        {
            const text = new Text({ text: null });

            expect(text.text).toEqual('');
        });

        it('should prevent setting null', () =>
        {
            const text = new Text(null);

            expect(text.text).toEqual('');
        });

        it('should prevent setting undefined', () =>
        {
            const text = new Text({});

            expect(text.text).toEqual('');
        });

        it('should allow setting \'\' for v5', () =>
        {
            const text = new Text('');

            expect(text.text).toEqual('');
        });

        it('should set width and height on the constructor', () =>
        {
            const text = new Text({
                text: 'food is so tasty',
                width: 100,
                height: 100,
            });

            // answer locally is 99.999999999999 which is acceptable!
            expect(text.width).toEqual(100);
            expect(text.height).toEqual(100);
        });
    });

    it('should measure bounds of text correctly when padding is set', () =>
    {
        const textNoPadding = new Text({ text: 'HI', style: { padding: 0 } });
        const text = new Text({ text: 'HI', style: { padding: 10 } });

        const boundsNoPadding = textNoPadding.getBounds();
        const bounds = text.getBounds();

        expect(boundsNoPadding.width).toBe(bounds.width);
        expect(boundsNoPadding.height).toBe(bounds.height);
    });

    describe('containsPoint', () =>
    {
        const text = new Text({ text: 'hello', style: { fontSize: 30 } });

        it('should return true when point inside', () =>
        {
            const point = new Point(10, 10);

            expect(text.containsPoint(point)).toBe(true);
        });

        it('should return true when anchor', () =>
        {
            text.anchor.set(0.5, 0.5);
            const point = new Point(-10, 10);

            expect(text.containsPoint(point)).toBe(true);
            text.anchor.set(0, 0);
        });
    });

    describe('autoGenerateMipmaps', () =>
    {
        it('should accept autoGenerateMipmaps in constructor', () =>
        {
            const text = new Text({ text: 'foo', autoGenerateMipmaps: true });

            expect(text.autoGenerateMipmaps).toBe(true);
        });

        it('should default to global TextureSource default when not provided', () =>
        {
            const text = new Text({ text: 'foo' });

            expect(text.autoGenerateMipmaps).toBe(TextureSource.defaultOptions.autoGenerateMipmaps);
        });

        it('should create texture with mipmaps when autoGenerateMipmaps is true', async () =>
        {
            const text = new Text({
                text: 'foo',
                autoGenerateMipmaps: true
            });

            const renderer = await getWebGLRenderer();
            const texture = renderer.canvasText.getTexture(text);

            expect(texture.source.autoGenerateMipmaps).toBe(true);

            renderer.destroy();
        });

        it('should create texture without mipmaps when autoGenerateMipmaps is false', async () =>
        {
            const text = new Text({
                text: 'foo',
                autoGenerateMipmaps: false
            });

            const renderer = await getWebGLRenderer();
            const texture = renderer.canvasText.getTexture(text);

            expect(texture.source.autoGenerateMipmaps).toBe(false);

            renderer.destroy();
        });

        it('should respect global default when autoGenerateMipmaps is undefined', async () =>
        {
            const text = new Text({ text: 'foo' });

            const renderer = await getWebGLRenderer();
            const texture = renderer.canvasText.getTexture(text);

            // Should use the global default (which is false by default)
            expect(texture.source.autoGenerateMipmaps).toBe(TextureSource.defaultOptions.autoGenerateMipmaps);

            renderer.destroy();
        });

        it('should respect global default when set to true', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to true
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                const text = new Text({ text: 'foo' });
                const renderer = await getWebGLRenderer();
                const texture = renderer.canvasText.getTexture(text);

                // Should respect the global default
                expect(texture.source.autoGenerateMipmaps).toBe(true);

                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });

        it('should allow per-instance override of global default (true to false)', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to true
                TextureSource.defaultOptions.autoGenerateMipmaps = true;

                // But override to false for this instance
                const text = new Text({ text: 'foo', autoGenerateMipmaps: false });
                const renderer = await getWebGLRenderer();
                const texture = renderer.canvasText.getTexture(text);

                // Should use the per-instance override
                expect(texture.source.autoGenerateMipmaps).toBe(false);

                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });

        it('should allow per-instance override of global default (false to true)', async () =>
        {
            // Save original value
            const originalValue = TextureSource.defaultOptions.autoGenerateMipmaps;

            try
            {
                // Set global default to false
                TextureSource.defaultOptions.autoGenerateMipmaps = false;

                // But override to true for this instance
                const text = new Text({ text: 'foo', autoGenerateMipmaps: true });
                const renderer = await getWebGLRenderer();
                const texture = renderer.canvasText.getTexture(text);

                // Should use the per-instance override
                expect(texture.source.autoGenerateMipmaps).toBe(true);

                renderer.destroy();
            }
            finally
            {
                // Restore original value
                TextureSource.defaultOptions.autoGenerateMipmaps = originalValue;
            }
        });
    });

    describe('word wrap width should not inflate text.width', () =>
    {
        it('should return actual content width for center-aligned Text', () =>
        {
            const text = new Text({
                text: 'text center',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });

            expect(text.width).toBeLessThan(800);
        });

        it('should return same content width regardless of alignment for Text', () =>
        {
            const center = new Text({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });
            const left = new Text({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'left' },
            });
            const right = new Text({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'right' },
            });

            expect(center.width).toBeLessThan(800);
            expect(left.width).toBeLessThan(800);
            expect(right.width).toBeLessThan(800);
            expect(center.width).toBeCloseTo(left.width, 0);
            expect(center.width).toBeCloseTo(right.width, 0);
        });

        it('should return matching widths for center vs left alignment with same text', () =>
        {
            const centerText = new Text({
                text: 'hello world',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });
            const leftText = new Text({
                text: 'hello world',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'left' },
            });

            expect(centerText.width).toBeLessThan(800);
            expect(leftText.width).toBeLessThan(800);
            expect(centerText.width).toBeCloseTo(leftText.width, 0);
        });

        it('should return actual content width for center-aligned BitmapText', () =>
        {
            const text = new BitmapText({
                text: 'text center',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });

            expect(text.width).toBeLessThan(800);
        });

        it('should return same content width regardless of alignment for BitmapText', () =>
        {
            const center = new BitmapText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'center' },
            });
            const left = new BitmapText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'left' },
            });
            const right = new BitmapText({
                text: 'hello',
                style: { fontFamily: 'Arial', fontSize: 36, wordWrap: true, wordWrapWidth: 800, align: 'right' },
            });

            expect(center.width).toBeLessThan(800);
            expect(left.width).toBeLessThan(800);
            expect(right.width).toBeLessThan(800);
            expect(center.width).toBeCloseTo(left.width, 0);
            expect(center.width).toBeCloseTo(right.width, 0);
        });
    });

    describe('word wrap should not break text that fits', () =>
    {
        it('should not wrap when wordWrapWidth matches measured width', () =>
        {
            const content = 'p jdk f svzmrq';

            const metrics = CanvasTextMetrics.measureText(
                content,
                new TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 8,
                    wordWrap: false,
                }),
            );

            const text = new Text({
                text: content,
                style: new TextStyle({
                    fontFamily: 'Arial',
                    fontSize: 8,
                    wordWrap: true,
                    wordWrapWidth: Math.ceil(metrics.width) + 1,
                }),
            });

            expect(text.height).toBeCloseTo(metrics.height, 0);
        });
    });
});
