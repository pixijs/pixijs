import { ColorMatrixFilter } from '~/filters';
import { Rectangle } from '~/maths';
import { Texture, TextureSource } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'Filter should render correctly when a render texture frame is not  0, 0',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const rect = new Graphics().rect(0, 0, 50, 50).fill('orange');

        const filter = new ColorMatrixFilter();

        filter.hue(90, true);

        rect.filters = [filter];

        const textureSource = new TextureSource({
            width: 128, height: 128,
        });

        const renderTexture = new Texture({
            source: textureSource,
            frame: new Rectangle(50, 50, 50, 50),
        });

        renderer.render({
            target: renderTexture,
            container: rect,
        });

        const fullRenderTexture = new Texture({
            source: textureSource,
        });

        renderer.extract.log(fullRenderTexture);
        const sprite = new Sprite(fullRenderTexture);

        scene.addChild(sprite);
    },
};
