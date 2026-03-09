import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render drop shadow with tagged text correctly using split text',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontStyle: 'normal',
            fontSize: 36,
            fill: 0xFFFFFF,
            align: 'center',
            dropShadow: {
                color: 0x000000,
                alpha: 0.5,
                blur: 0,
                distance: 15,
                angle: 45,
            },
            tagStyles: {
                red: { dropShadow: { color: 'red' } },
                blue: { dropShadow: { color: 'blue' } },
            },
        });

        const text = new Text({
            text: 'Hello\n<red>Pixi</red><blue>JS</blue>',
            style
        });

        const splitResult = SplitText.from(text);

        scene.addChild(splitResult);

        renderer.render(scene);
        splitResult.style.dropShadow.color = 'green';
        splitResult.styleChanged();
    },
};
