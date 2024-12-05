import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should create a texture correctly createTexture',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const texture = renderer.canvasText.getTexture({
            text: `text as\ntexture\n🔥`,
            style: {
                fontSize: 18,
                fill: 'white',
                stroke: { color: 'white', width: 2 },
                lineHeight: 15,
                letterSpacing: 6,

                dropShadow: {
                    alpha: 1,
                    angle: Math.PI / 6,
                    blur: 5,
                    color: 'blue',
                    distance: 5,
                },
            },
        });

        const sprite = new Sprite({
            texture,
            anchor: 0.5,
            x: 128 / 2,
            y: 128 / 2
        });

        scene.addChild(sprite);
    },
};
