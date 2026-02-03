import { Text } from '../../../../src/scene/text/Text';
import { Assets } from '~/assets';
import { type Container, FillGradient, type TextureSpace } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text fill correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');
        const createText = (type: TextureSpace, offsetX: number, offsetY: number, stroke = false) =>
        {
            const fillGradient = new FillGradient({
                end: { x: type === 'local' ? 1 : 60, y: type === 'local' ? 1 : 30 },
                colorStops: [
                    { offset: 0, color: 0xff0000 },
                    { offset: 0.5, color: 0x00ff00 },
                    { offset: 1, color: 0x0000ff },
                ],
                textureSpace: type,
            });

            const text = new Text({
                text: 'Im fill',
                style: {
                    fontFamily: 'Outfit',
                    fill: !stroke ? fillGradient : { color: 0xffffff, alpha: 0.5 },
                    stroke: stroke ? { fill: fillGradient, width: 5 } : undefined,
                },
                y: offsetY,
                x: offsetX,
            });

            scene.addChild(text);
        };

        createText('global', 5, 0);
        createText('local', 5, 32);

        createText('global', 5, 64, true);
        createText('local', 5, 96, true);
    },
};
