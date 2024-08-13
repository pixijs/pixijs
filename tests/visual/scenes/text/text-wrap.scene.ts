import { Text } from '../../../../src/scene/text/Text';
import { BitmapText } from '../../../../src/scene/text-bitmap/BitmapText';
import { HTMLText } from '../../../../src/scene/text-html/HTMLText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render wrapped text correctly',
    pixelMatch: 200,
    create: async (scene: Container, renderer) =>
    {
        const text = new Text({
            text: 'New,\nLine',
            style: {
                wordWrap: true,
                wordWrapWidth: 10,
                fontSize: 20
            },
        });

        scene.addChild(text);

        const bittext = new BitmapText({
            text: 'New,\nLine',
            style: {
                wordWrap: true,
                wordWrapWidth: 10,
                fontSize: 20
            },
            x: 60,
        });

        scene.addChild(bittext);
        const htmltext = new HTMLText({
            text: 'New,\nLine',
            style: {
                // wordWrap: true,
                // wordWrapWidth: 10,
                fontSize: 20
            },
            x: 60,
            y: 45,
        });

        scene.addChild(htmltext);

        renderer.render(scene);
        await new Promise((resolve) => setTimeout(resolve, 100));
    },
};
