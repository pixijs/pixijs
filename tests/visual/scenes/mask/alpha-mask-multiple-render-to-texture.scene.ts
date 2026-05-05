import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render multiple alpha masks with renderMaskToTexture correctly',
    create: async (scene: Container) =>
    {
        // Two differently-sized Graphics masks to trigger TexturePool reuse
        // with different frames on the same pooled texture object.
        // Graphics masks use AlphaMask with renderMaskToTexture = true internally.
        const maskA = new Graphics().rect(0, 0, 50, 40).fill(0xffffff);

        maskA.position.set(5, 10);

        const maskB = new Graphics().rect(0, 0, 35, 55).fill(0xffffff);

        maskB.position.set(68, 8);

        const squareA = new Graphics().rect(0, 0, 60, 60).fill(0x00cc66);

        squareA.position.set(2, 5);
        squareA.mask = maskA;

        const squareB = new Graphics().rect(0, 0, 60, 60).fill(0x3388ff);

        squareB.position.set(60, 5);
        squareB.mask = maskB;

        scene.addChild(squareA, squareB);
        scene.addChild(maskA, maskB);
    },
};
