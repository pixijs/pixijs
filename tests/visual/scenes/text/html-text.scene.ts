import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { HTMLTextStyle } from '../../../../src/scene/text-html/HtmlTextStyle';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render html-text correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const htmlTexture = await renderer.htmlText.getTexture({
            text: '<red>Red</red>\n<blue>Blue</blue>\n<green>Green</green>',
            renderMode: 'html',
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
