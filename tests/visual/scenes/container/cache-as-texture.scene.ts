import { Container, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render cache as texture correctly',
    create: async (scene: Container) =>
    {
        const root = new Container();

        let last = root;

        root.x = (128 / 2) - 30;
        root.y = (128 / 2) - 53;

        // 6 colors
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFFFF, 0xCCFF00, 0xFFFFFF];

        for (let i = 0; i < 5; i++)
        {
            const container = new Container();

            container.x = 100;
            container.y = 0;

            const text = new Text({
                text: 'hello',
                style: {
                    fontSize: 32,
                    fill: colors[i % colors.length]
                }
            });

            container.addChild(text);

            if (i === 0)
            {
                container.cacheAsTexture({
                    antialias: true,
                    resolution: 2
                });
            }
            else
            {
                container.cacheAsTexture(true);
            }

            last.addChild(container);

            last = container;

            last.rotation = 0.420 * 3;
        }

        root.scale.set(0.7);

        scene.addChild(root);
    },
};
