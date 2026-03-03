import { BitmapFont, BitmapText, Graphics, Text } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render bitmap text line height correctly',
    create: async (scene: Container) =>
    {
        const refText = new Text({
            text: 'Test\nHello\nText',
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                lineHeight: 40,
                fill: 'white',
            },
            x: 2,
            y: 2,
        });

        scene.addChild(refText);
        scene.addChild(new Graphics().rect(refText.x, refText.y, refText.width, refText.height).stroke({ color: 'white' }));

        BitmapFont.install({
            name: 'Custom',
            style: {
                fontFamily: 'Arial',
                lineHeight: 10,
            }
        });

        const bmpText = new BitmapText({
            text: 'Test\nHello\nCustom',
            style: {
                fontFamily: 'Custom',
                fontSize: 12,
                lineHeight: 40,
                fill: 'black',
            },
            x: 36,
            y: 2,
        });

        scene.addChild(bmpText);
        scene.addChild(new Graphics().rect(bmpText.x, bmpText.y, bmpText.width, bmpText.height).stroke({ color: 'black' }));

        const bmpText2 = new BitmapText({
            text: 'Test\nHello\nArial',
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                lineHeight: 40,
                fill: 'yellow',
            },
            x: 85,
            y: 2,
        });

        scene.addChild(bmpText2);
        scene.addChild(new Graphics().rect(bmpText2.x, bmpText2.y, bmpText2.width, bmpText2.height).stroke({
            color: 'yellow'
        }));
    },
};
