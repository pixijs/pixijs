import { ColorMatrixFilter } from '@/filters/defaults/color-matrix/ColorMatrixFilter';
import { Rectangle } from '@/maths/shapes/Rectangle';
import { TextureSource } from '@/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '@/rendering/renderers/shared/texture/Texture';
import { Graphics } from '@/scene/graphics/shared/Graphics';
import { Sprite } from '@/scene/sprite/Sprite';

import type { TestScene } from '../../types';
import type { Renderer } from '@/rendering/renderers/types';
import type { Container } from '@/scene/container/Container';

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
