import { Sprite } from '../../src/scene/sprite/Sprite';
import { Text } from '../../src/scene/text/Text';
import { getRenderer } from '../utils/getRenderer';

import type { DestroyOptions } from '../../src/scene/container/destroyTypes';

describe('Text', () =>
{
    describe('properties', () =>
    {
        it('should modify the height of the object when setting height', () =>
        {
            const text = new Text({ text: 'foo' });

            text.height = 300;

            expect(text.height).toEqual(300);
        });

        it('should modify the width of the object when setting width', () =>
        {
            const text = new Text({ text: 'foo' });

            text.width = 300;

            expect(text.width).toEqual(300);
        });

        it('should set the text resolution to match the resolution setting when constructed time', () =>
        {
            const text = new Text({ text: 'foo' });

            expect(text.resolution).toEqual(settings.RESOLUTION);
        });

        it('should update the text resolution to match the renderer resolution when being rendered to screen', async () =>
        {
            const text = new Text({ text: 'foo' });

            expect(text.resolution).toEqual(settings.RESOLUTION);

            const renderer = await getRenderer({ resolution: 2 });

            expect(renderer.resolution).toEqual(2);

            renderer.render(text);

            expect(text.resolution).toEqual(renderer.resolution);

            renderer.destroy();
        });

        it('should use any manually set text resolution over the renderer resolution', async () =>
        {
            const text = new Text({ text: 'foo' });

            text.resolution = 3;

            expect(text.resolution).toEqual(3);

            const renderer = await getRenderer({ resolution: 2 });

            renderer.render(text);

            expect(text.resolution).toEqual(3);

            renderer.destroy();
        });
    });

    describe('destroy', () =>
    {
        it('should now clear canvas size on imported canvas', () =>
        {
            const canvas = document.createElement('canvas');
            // const text = new Text('blah', {}, canvas);
            const text = new Text({ text: 'blah' });

            const { width, height } = canvas;

            text.destroy();

            expect(canvas.width).toEqual(width);
            expect(canvas.height).toEqual(height);
        });

        it('should clear size on owned canvas during destroy', () =>
        {
            const text = new Text({ text: 'blah' });
            const { canvas } = text;

            text.destroy();

            expect(canvas.width).toEqual(0);
            expect(canvas.height).toEqual(0);
        });

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
            expect(child.destroy).toEqual(true);
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
            expect(childDestroyOpts).toEqual({ children: true, texture: true, baseTexture: true });
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

        it('should trim an empty string', () =>
        {
            const text = new Text(' ', { trim: true });

            expect(text.text).toEqual('');
        });

        it('should allow setting \'\' for v5', () =>
        {
            const text = new Text('');

            expect(text.text).toEqual('');
        });

        it('should keep at least 1 pixel for canvas width and height', () =>
        {
            const text = new Text({ text: '' });

            text.updateText(undefined);

            expect(text.canvas.width).toBeGreaterThan(1);
            expect(text.canvas.height).toBeGreaterThan(1);

            text.text = '\n';

            expect(text.canvas.width).toBeGreaterThan(0);
        });
    });
});
