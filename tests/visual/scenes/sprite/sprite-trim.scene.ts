import { Assets } from '~/assets';
import { Container, Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render a trimmed sprite correctly',
    create: async (scene: Container) =>
    {
        await Assets.load([
            `sprite-sheet-trim.json`
        ]);

        const container = new Container();

        container.scale.set(0.35);

        const sprite = Sprite.from('paws_1');

        container.addChild(sprite);

        const bounds = container.getBounds();
        const boundsRect = new Graphics()
            .rect(0, 0, bounds.maxX, bounds.maxY)
            .stroke({ pixelLine: true });

        scene.addChild(container);
        scene.addChild(boundsRect);
    },
};
