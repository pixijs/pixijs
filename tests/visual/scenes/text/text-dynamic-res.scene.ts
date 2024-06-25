import { Text } from '../../../../src/scene/text/Text';
import { TextStyle } from '../../../../src/scene/text/TextStyle';
import { HTMLText } from '../../../../src/scene/text-html/HTMLText';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render text at new resolution',
    pixelMatch: 5100,
    create: async (scene: Container, renderer) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 20,
            fill: 0xFFFFFF,
            align: 'center',
        });

        const text = new Text({
            text: 'PixiJS Text',
            style
        });

        const htmlText = new HTMLText({
            text: 'PixiJS HTML',
            style
        });

        text.position.set(0, 50);
        scene.addChild(text, htmlText);

        renderer.render(scene);
        await new Promise((r) => setTimeout(r, 100));
        renderer.resolution = 4;

        renderer.render(scene);
        await new Promise((r) => setTimeout(r, 100));
    },
};
