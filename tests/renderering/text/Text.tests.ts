/* eslint-disable max-len */
import { Container } from '../../../src/scene/container/Container';
import { Sprite } from '../../../src/scene/sprite/Sprite';
import { Text } from '../../../src/scene/text/Text';
import { TextStyle } from '../../../src/scene/text/TextStyle';
import { BitmapText } from '../../../src/scene/text-bitmap/BitmapText';
import { getWebGLRenderer } from '../../utils/getRenderer';
import '../../../src/scene/graphics/init';
import '../../../src/scene/text-bitmap/init';
import '../../../src/scene/text/init';

import type { DestroyOptions } from '../../../src/scene/container/destroyTypes';

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

            const texture = renderer.renderPipes.text['_getGpuText'](text).texture;

            expect(texture.source.resolution).toEqual(2); // <-- getting null

            renderer.destroy();
        });

        it('should use any manually set text resolution over the renderer resolution', async () =>
        {
            const text = new Text({ text: 'foo', resolution: 3 });

            expect(text.resolution).toEqual(3);

            const renderer = await getWebGLRenderer({ resolution: 2 });

            const texture = renderer.canvasText.getManagedTexture(text);

            expect(texture.source.resolution).toEqual(3);

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

            const key = text._getKey();

            container.addChild(text);

            renderer.render({ container });

            expect(renderer.canvasText['_activeTextures'][key].usageCount).toBe(1);

            text.destroy();

            expect(renderer.renderPipes.text['_gpuText'][text.uid]).toBeNull();
            expect(renderer.canvasText['_activeTextures'][key]).toBeNull();
        });

        it('should destroy bitmap text correctly on the pipes and systems', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const text = new BitmapText({ text: 'foo' });

            container.addChild(text);

            renderer.render({ container });

            expect(renderer.renderPipes.bitmapText['_gpuBitmapText'][text.uid]).not.toBeNull();

            text.destroy();

            expect(renderer.renderPipes.bitmapText['_gpuBitmapText'][text.uid]).toBeNull();
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
});
