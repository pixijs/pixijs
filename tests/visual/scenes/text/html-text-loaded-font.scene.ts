import { Assets } from '../../../../src/assets/Assets';
import { Sprite } from '../../../../src/scene/sprite/Sprite';
import { HTMLTextStyle } from '../../../../src/scene/text-html/HtmlTextStyle';

import type { Renderer } from '../../../../src/rendering/renderers/types';
import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render html-text correctly',
    create: async (scene: Container, renderer: Renderer) =>
    {
        await Assets.load({ alias: 'Crosterian', src: 'fonts/Crosterian.woff2' });

        const htmlTexture = await renderer.htmlText.getTexture({
            text: '<red>Arial</red>\n<blue>load</blue>',
            resolution: 1,
            style: new HTMLTextStyle({
                fill: 'white',
                fontSize: 25,
                fontFamily: 'Crosterian',
                tagStyles: {
                    red: {
                        fill: 'red',
                        fontSize: 35,
                        fontFamily: 'Arial',
                    },
                    blue: {
                        fill: 'blue',
                    }
                }
            })
        });

        const sprite = new Sprite(htmlTexture);

        scene.addChild(sprite);
    },
};
