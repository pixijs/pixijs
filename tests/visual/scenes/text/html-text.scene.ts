import { Sprite } from '~/scene/sprite/Sprite';
import { HTMLTextStyle } from '~/scene/text-html/HTMLTextStyle';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering/renderers/types';
import type { Container } from '~/scene/container/Container';

export const scene: TestScene = {
    it: 'should render html-text correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const htmlTexture = await renderer.htmlText.getTexture({
            text: '<red>Red</red>\n<blue>Blue</blue>\n<green>Green</green>',
            resolution: 1,
            style: new HTMLTextStyle({
                fill: 'white',
                fontSize: 35,
                tagStyles: {
                    red: {
                        fill: 'red',
                    },
                    blue: {
                        fill: 'blue',
                    },
                    green: {
                        fill: 'green',
                    }
                }
            })
        });

        const sprite = new Sprite(htmlTexture);

        scene.addChild(sprite);
    },
};
