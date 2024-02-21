import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should not clear a canvas after it has been resized',
    only: true,
    create: async (scene: Container) =>
    {
        const rect = new Graphics({
            x: 8,
            y: 8
        });

        scene.addChild(rect);

        const canvas = document.createElement('canvas');

        canvas.width = 16;
        canvas.height = 16;

        const ctx = canvas.getContext('2d');
        const texture = Texture.from(canvas);

        canvas.width = 32;
        canvas.height = 32;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 16, 16);

        texture.source.update();
        texture.update();

        rect.clear();
        rect.rect(0, 0, 128, 128);
        rect.fill({ texture });
    },
};
