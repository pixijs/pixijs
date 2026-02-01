import { Assets } from '~/assets';
import { Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke line joins with tagged text correctly',
    options: {
        width: 200,
        height: 300,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text = new Text({
            text: '<miter>MWV</miter>\n<round>MWV</round>\n<bevel>MWV</bevel>',
            style: {
                fontFamily: 'Outfit',
                fontSize: 64,
                fill: 'white',
                padding: 10,
                tagStyles: {
                    miter: {
                        stroke: {
                            color: 0x333333,
                            width: 16,
                            join: 'miter',
                        },
                    },
                    round: {
                        stroke: {
                            color: 0x333333,
                            width: 16,
                            join: 'round',
                        },
                    },
                    bevel: {
                        stroke: {
                            color: 0x333333,
                            width: 16,
                            join: 'bevel',
                        },
                    },
                },
            },
        });

        text.x = 20;
        text.y = 20;
        scene.addChild(text);
    },
};
