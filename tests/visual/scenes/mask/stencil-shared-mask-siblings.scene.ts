import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

// rows of cells that share one mask per row (adjacent siblings pop and push the same mask), the second row inverse
export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render siblings that share a stencil mask and an inverse stencil mask',
    create: async (scene: Container) =>
    {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

        for (let row = 0; row < 2; row++)
        {
            const mask = new Graphics().roundRect(8, (row * 64) + 8, 112, 48, 20).fill(0xffffff);

            scene.addChild(mask);

            for (let col = 0; col < 4; col++)
            {
                const cell = new Graphics()
                    .rect(col * 32, row * 64, 32, 64)
                    .fill(colors[(col + row) % colors.length])
                    .circle((col * 32) + 16, (row * 64) + 32, 10)
                    .fill(0xffffff);

                cell.setMask({ mask, inverse: row === 1 });
                scene.addChild(cell);
            }
        }
    },
};
