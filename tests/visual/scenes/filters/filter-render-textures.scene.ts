import { ColorMatrixFilter } from '../../../../src/filters/defaults/color-matrix/ColorMatrixFilter';
import { Rectangle } from '../../../../src/maths/shapes/Rectangle';
import { TextureSource } from '../../../../src/rendering/renderers/shared/texture/sources/TextureSource';
import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

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
