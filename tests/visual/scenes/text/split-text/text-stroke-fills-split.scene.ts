import { Color } from '~/color';
import { FillGradient, SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container, FillStyle, StrokeStyle } from '~/scene';

export const scene: TestScene = {
    it: 'should update text fill/stroke through proxy using split text',
    create: async (scene: Container, renderer) =>
    {
        const text = new Text({
            text: 'PixiJS',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                stroke: {
                    color: 0xff0000
                },
            },
        });
        const text2 = new Text({
            text: 'PixiJS',
            style: {
                fontSize: 24,
                fill: {
                    color: 0xffffff,
                    alpha: 0.5,
                },
                stroke: {
                    color: new Color(0xff0000)
                },
            },
        });
        const gradient = new FillGradient(0, 0, 67, 0, 'global')
            .addColorStop(0, 0xff0000)
            .addColorStop(0.5, 0x00ff00)
            .addColorStop(1, 0x0000ff);
        const text3 = new Text({
            text: 'PixiJS',
            style: {
                fontSize: 24,
                fill: {
                    color: 0xffffff,
                    alpha: 0.5,
                },
                stroke: { fill: gradient },
            },
        });

        const split1 = SplitText.from(text);
        const split2 = SplitText.from(text2);
        const split3 = SplitText.from(text3);

        split2.y = (text.height);
        split3.y = ((text.height) * 2);

        scene.addChild(split1, split2, split3);

        renderer.render(scene);

        (split1.style.stroke as StrokeStyle).width = 5;
        (split2.style.stroke as StrokeStyle).width = 5;
        (split3.style.stroke as StrokeStyle).width = 5;
        split1.style.fill = 0x0000ff;
        (split2.style.fill as FillStyle).color = 0x0000ff;
        (split3.style.fill as FillStyle).color = 0x0000ff;
        (split3.style.fill as FillStyle).alpha = 1;
        split1.styleChanged();
        split2.styleChanged();
        split3.styleChanged();
    },
};
