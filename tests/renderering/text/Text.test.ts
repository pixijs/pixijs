import { Container } from '../../../src/rendering/scene/Container';
import { Sprite } from '../../../src/rendering/sprite/shared/Sprite';
import { Text } from '../../../src/rendering/text/Text';
import { getRenderer } from '../sprite/getRenderer';
import '../../../src/rendering/renderers/shared/texture/Texture';

import type { DestroyOptions } from '../../../src/rendering/scene/destroyTypes';

describe('Text', () =>
{
    it('should destroy children if children flag is set', () =>
    {
        const text = new Text({ text: 'foo' });
        const child = new Sprite();

        text.addChild(child);
        text.destroy({ children: true });
        expect(text.position).toEqual(null);
        expect(child.position).toEqual(null);
    });

    it('should accept options correctly', () =>
    {
        const text = new Text({ text: 'foo' });
        const child = new Sprite();

        text.addChild(child);
        text.destroy(true);
        expect(text.position).toEqual(null);
        expect(child.position).toEqual(null);
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

    it('should destroy correctly on the pipes and systems', async () =>
    {
        const renderer = await getRenderer();

        const container = new Container();

        const text = new Text({ text: 'foo' });

        const key = text.view._getKey();

        container.addChild(text);

        renderer.render(container);

        expect(renderer.canvasText['activeTextures'][key].usageCount).toBe(1);

        text.destroy();

        expect(renderer.renderPipes.text['gpuText'][text.uid]).toBeNull();
        expect(renderer.canvasText['activeTextures'][key]).toBeNull();
    });
});
