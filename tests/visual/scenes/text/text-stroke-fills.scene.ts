import { Color } from '../../../../src/color/Color';
import { FillGradient } from '../../../../src/scene/graphics/shared/fill/FillGradient';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { FillStyle, StrokeStyle } from '../../../../src/scene/graphics/shared/FillTypes';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should update text fill/stroke through proxy',
    pixelMatch: 367,
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
        const gradient = new FillGradient(0, 0, 67, 0)
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

        text2.y = (text.height);
        text3.y = ((text.height) * 2);

        scene.addChild(text, text2, text3);

        renderer.render(scene);

        (text.style.stroke as StrokeStyle).width = 5;
        (text2.style.stroke as StrokeStyle).width = 5;
        (text3.style.stroke as StrokeStyle).width = 5;
        text.style.fill = 0x0000ff;
        (text2.style.fill as FillStyle).color = 0x0000ff;
        (text3.style.fill as FillStyle).color = 0x0000ff;
        (text3.style.fill as FillStyle).alpha = 1;
    },
};
