import { setTimeout } from 'node:timers/promises';
import { HTMLText, HTMLTextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text at new resolution',
    create: async (scene: Container, renderer) =>
    {
        const style = new HTMLTextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
        });

        const text = new HTMLText({
            text: 'PixiJS',
            style
        });

        scene.addChild(text);

        renderer.render(scene);
        await setTimeout(350);
        text.resolution = 0.5;

        renderer.render(scene);
        await setTimeout(350);
    },
};
