import { Color } from '~/color';
import { type Renderer } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    excludeRenderers: ['canvas'],
    it: 'should render mask using alpha channel instead of red channel',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const rect = new Graphics()
            .rect(0, 0, 100, 100)
            .fill(new Color('red'));

        // Create a blue circle graphic and render it to a texture.
        // The resulting texture has R≈0, A=1 inside the circle.
        // With channel='alpha', the mask reveals content (A=1).
        // With channel='red', the mask would hide content (R≈0).
        const blueCircle = new Graphics()
            .circle(0, 0, 25)
            .fill(0x0000FF);

        const maskTexture = renderer.generateTexture({
            target: blueCircle,
        });

        const maskSprite = new Sprite(maskTexture);

        maskSprite.anchor.set(0.5);
        maskSprite.position.set(128 / 2);

        rect.setMask({
            mask: maskSprite,
            channel: 'alpha',
        });

        scene.addChild(rect);
        scene.addChild(maskSprite);
    },
};
