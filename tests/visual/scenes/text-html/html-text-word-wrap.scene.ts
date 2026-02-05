import { Assets } from '~/assets';
import { HTMLText } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text word wrap correctly',
    options: {
        width: 300,
        height: 350,
    },
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('fonts/outfit.woff2');

        const text1 = new HTMLText({
            text: 'Hello world this is a test',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
            },
        });

        text1.x = 10;
        text1.y = 10;
        scene.addChild(text1);

        const text2 = new HTMLText({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: false,
            },
        });

        text2.x = 10;
        text2.y = 110;
        scene.addChild(text2);

        const text3 = new HTMLText({
            text: 'Supercalifragilisticexpialidocious',
            style: {
                fontFamily: 'Outfit',
                fontSize: 28,
                wordWrap: true,
                wordWrapWidth: 200,
                breakWords: true,
            },
        });

        text3.x = 10;
        text3.y = 200;
        scene.addChild(text3);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 250));
    },
};
