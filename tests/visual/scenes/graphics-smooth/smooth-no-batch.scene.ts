import { Assets } from '~/assets';
import { Container, SmoothGraphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render contexts that are not batched with tint and alpha',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('bunny.png');
        const parent = new Container({ alpha: 0.8 });

        const draw = (g: SmoothGraphics) => g
            .rect(4, 4, 52, 52)
            .fill({ texture, textureSpace: 'local' })
            .circle(30, 30, 14)
            .fill(0xffffff)
            .stroke({ color: 0x000000, width: 3 });

        const batched = draw(new SmoothGraphics());
        const notBatched = draw(new SmoothGraphics());

        notBatched.context.batchMode = 'no-batch';
        notBatched.x = 64;

        const tinted = draw(new SmoothGraphics({ tint: 0xff8800, alpha: 0.5 }));
        const tintedNotBatched = draw(new SmoothGraphics({ tint: 0xff8800, alpha: 0.5 }));

        tintedNotBatched.context.batchMode = 'no-batch';
        tinted.y = tintedNotBatched.y = 64;
        tintedNotBatched.x = 64;

        parent.addChild(batched, notBatched, tinted, tintedNotBatched);
        scene.addChild(parent);
    },
};
