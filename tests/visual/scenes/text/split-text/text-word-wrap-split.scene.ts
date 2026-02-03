import { Assets } from '~/assets';
import { SplitText, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render word wrap with split text correctly',
    options: {
        width: 300,
        height: 350,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new Text({
            text: 'Hello world this is a test',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
            },
        });

        const split1 = SplitText.from(text1);

        split1.x = 10;
        split1.y = 10;
        scene.addChild(split1);

        const text2 = new Text({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: false,
            },
        });

        const split2 = SplitText.from(text2);

        split2.x = 10;
        split2.y = 110;
        scene.addChild(split2);

        const text3 = new Text({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
            },
        });

        const split3 = SplitText.from(text3);

        split3.x = 10;
        split3.y = 200;
        scene.addChild(split3);
    },
};
