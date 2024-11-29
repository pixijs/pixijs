import { Assets } from '../../../../src/assets/Assets';
import { Container } from '../../../../src/scene/container/Container';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

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
