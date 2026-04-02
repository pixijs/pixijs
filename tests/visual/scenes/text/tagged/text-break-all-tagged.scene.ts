import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should break at any character with breakWords:true (CSS break-all)',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const style = {
            fontFamily: 'Outfit',
            fontSize: 20,
            wordWrap: true,
            wordWrapWidth: 80,
            breakWords: true,
            tagStyles: {
                green: { fill: 'green' },
                yellow: { fill: 'yellow' },
            },
        };

        const text1 = new Text({
            text: '<green>Thiswillbreak</green>',
            style,
        });

        const text2 = new Text({
            text: '<yellow>Hello</yellow> <green>World</green> Test',
            style,
            position: { x: 0, y: 50 }
        });

        scene.addChild(text1);
        scene.addChild(text2);
    },
};
