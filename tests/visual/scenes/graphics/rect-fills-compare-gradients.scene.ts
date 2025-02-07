import { FillGradient } from '../../../../src/scene/graphics/shared/fill/FillGradient';
import { Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container, TextureSpace } from '~/scene';

export const scene: TestScene = {
    it: 'should render rects with fills using gradients',
    create: async (scene: Container) =>
    {
        const createGraphic = (type: TextureSpace, offsetX: number, offsetY: number, stroke = false) =>
        {
            const bg = new Graphics();
            const rect = new Graphics();

            const xy = type === 'local' ? [0, 0, 1, 1] : [0, 0, 50, 50];
            const gradient = new FillGradient(...xy, type as any);

            gradient.addColorStop(0, 0xff0000);
            gradient.addColorStop(0.5, 0x00ff00);
            gradient.addColorStop(1, 0x0000ff);

            const command = stroke ? 'stroke' : 'fill';
            const style = stroke ? { width: 5, fill: gradient } : gradient;

            rect.setStrokeStyle({ width: 5 });
            rect.rect(offsetX, offsetY, 50, 50)[command](style);
            scene.addChild(bg, rect);
        };

        createGraphic('global', 5, 0);
        createGraphic('local', 60, 0);

        createGraphic('global', 10, 60, true);
        createGraphic('local', 70, 60, true);
    },
};
