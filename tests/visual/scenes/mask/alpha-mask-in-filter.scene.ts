import { AlphaFilter } from '~/filters';
import { AlphaMask } from '~/rendering';
import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render a render-to-texture alpha mask inside a filtered container',
    create: async (scene: Container) =>
    {
        // offset from the canvas origin, so content drawn relative to the filter
        // bounds instead of inside the container lands somewhere else
        const root = new Container({ x: 24, y: 24 });

        // a Graphics mask is rendered to a texture (renderMaskToTexture)
        const mask = new Graphics().circle(40, 40, 32).fill(0xFFFFFF);
        const content = new Graphics().rect(0, 0, 80, 80).fill(0xFF0000);

        root.addChild(mask, content);
        content.addEffect(new AlphaMask({ mask }));

        // a filter that changes nothing is enough
        root.filters = [new AlphaFilter({ alpha: 1 })];

        scene.addChild(root);
    },
};
