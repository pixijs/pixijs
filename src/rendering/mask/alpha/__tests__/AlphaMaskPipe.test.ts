import { getWebGLRenderer } from '@test-utils';
import { MaskFilter } from '~/filters';
import { Texture } from '~/rendering';
import { Container, Sprite } from '~/scene';
import { BigPool } from '~/utils';

import type { FilterEffect } from '~/filters';
import type { Renderer } from '~/rendering';

function createSceneWithSiblingMasks(maskSizes: number[]): Container
{
    const stage = new Container();

    for (const size of maskSizes)
    {
        const panel = new Container();
        const content = new Sprite(Texture.WHITE);

        content.setSize(80, 80);

        const mask = new Sprite(Texture.WHITE);

        mask.setSize(size, size);

        panel.addChild(content, mask);
        panel.mask = mask;
        stage.addChild(panel);
    }

    return stage;
}

const getReturnedMaskEffects = (spy: jest.SpyInstance): FilterEffect[] =>
    spy.mock.calls
        .map((call) => call[0] as FilterEffect)
        .filter((item) => item.filters?.[0] instanceof MaskFilter);

describe('AlphaMaskPipe', () =>
{
    let renderer: Renderer;

    beforeEach(async () =>
    {
        renderer = await getWebGLRenderer();
    });

    afterEach(() =>
    {
        renderer.destroy();
        jest.restoreAllMocks();
    });

    it('should give each sibling sprite mask its own pooled effect within a frame', () =>
    {
        const spy = jest.spyOn(BigPool, 'return');

        renderer.render(createSceneWithSiblingMasks([40, 60]));

        // reusing one effect for both masks would make them share the MaskFilter's
        // uniform buffer, which on WebGPU renders every mask with the last mask's matrix
        const effects = getReturnedMaskEffects(spy);

        expect(effects).toHaveLength(2);
        expect(effects[0]).not.toBe(effects[1]);
    });

    it('should not return mask effects to the pool until postrender', () =>
    {
        const spy = jest.spyOn(BigPool, 'return');
        let returnsBeforePostrender = -1;

        renderer.runners.renderEnd.add({
            renderEnd: () => { returnsBeforePostrender = getReturnedMaskEffects(spy).length; },
        });

        renderer.render(createSceneWithSiblingMasks([40, 60]));

        expect(returnsBeforePostrender).toBe(0);
        expect(getReturnedMaskEffects(spy)).toHaveLength(2);
    });

    it('should reuse pooled effects across frames', () =>
    {
        const scene = createSceneWithSiblingMasks([40, 60]);
        const spy = jest.spyOn(BigPool, 'return');

        renderer.render(scene);

        const firstFrame = getReturnedMaskEffects(spy);

        spy.mockClear();
        renderer.render(scene);

        const secondFrame = getReturnedMaskEffects(spy);

        expect(secondFrame).toHaveLength(2);
        expect(new Set(secondFrame)).toEqual(new Set(firstFrame));
    });
});
