import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { TilingSprite } from '../../../../src/scene/sprite-tiling/TilingSprite';
import { basePath } from '../../../assets/basePath';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render tiling sprite with clampOffset correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const texture = await Assets.load(`${basePath}textures/bunny.png`);
        const texture1 = renderer.generateTexture({ target: new Sprite({ texture }), resolution: 1 });
        const texture2 = renderer.generateTexture({ target: new Sprite({ texture }), resolution: 2 });

        const sprite1 = new TilingSprite({
            texture: texture1,
            width: 100,
            height: 50,
        });
        const sprite2 = new TilingSprite({
            texture: texture2,
            width: 100,
            height: 50,
            y: 50,
        });

        texture1.textureMatrix.clampOffset = texture1.source.pixelWidth / 2;
        texture1.textureMatrix.update();
        texture2.textureMatrix.clampOffset = texture2.source.pixelWidth / 2;
        texture2.textureMatrix.update();

        scene.addChild(sprite1, sprite2);
    },
};
