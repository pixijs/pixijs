import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene';
import type { TestScene } from '../../types';

// eslint-disable-next-line max-len
const base64Image = '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';

export const scene: TestScene = {
    it: 'should render a htmlImageElement as a texture',
    create: async (scene: Container) =>
    {
        const image = await new Promise((resolve, reject) =>
        {
            const img = new Image();

            img.onload = () => resolve(img);
            img.onerror = reject;
            img.crossOrigin = 'anonymous';

            img.src = `data:image/png;base64,${base64Image}`;
        });

        const texture = Texture.from(image);

        const sprite = new Sprite(texture);

        scene.addChild(sprite);
    },
};
