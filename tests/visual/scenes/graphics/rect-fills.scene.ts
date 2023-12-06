import { Assets } from '../../../../src/assets/Assets';
import { Matrix } from '../../../../src/maths/matrix/Matrix';
import { FillGradient } from '../../../../src/scene/graphics/shared/fill/FillGradient';
import { Graphics } from '../../../../src/scene/graphics/shared/Graphics';
import { basePath } from '../../../assets/basePath';

import type { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render rects with fills, strokes, gradients using textures',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load<Texture>({
            src: `${basePath}textures/bunny.png`,
            data: {
                resolution: 1,
                width: 13,
                height: 19,
            }
        });
        const texture2 = await Assets.load<Texture>({
            src: `${basePath}textures/piece-newt-single.png`,
            data: {
                resolution: 1,
            }
        });

        // texture fill
        const rect1 = new Graphics();

        rect1.rect(50, 0, 50, 50).fill({ texture });
        scene.addChild(rect1);

        // gradient fill
        const rect2 = new Graphics();
        const gradient = new FillGradient(0, 0, 50, 50);

        gradient.addColorStop(0, 0xff0000);
        gradient.addColorStop(0.5, 0x00ff00);
        gradient.addColorStop(1, 0x0000ff);

        rect2.rect(0, 0, 50, 50).fill(gradient);
        scene.addChild(rect2);

        // texture fill & transform matrix on texture
        const rect3 = new Graphics();

        rect3.rect(0, 50, 50, 50).fill({ texture, matrix: new Matrix().rotate(0.5).scale(0.5, 1) });
        scene.addChild(rect3);

        // line with texture fill
        const line = new Graphics();

        line.lineTo(50, 50).stroke({ width: 5, texture })
            .moveTo(0, 50).lineTo(50, 0)
            .stroke({ width: 10, texture });
        scene.addChild(line);

        // rect with separate texture fill
        const rect4 = new Graphics();

        rect4.rect(50, 50, 50, 50).fill({ texture: texture2, matrix: new Matrix().scale(0.2, 0.2) })
            .stroke({ width: 5, texture, color: 0xff0000 });

        scene.addChild(rect4);
    },
};
