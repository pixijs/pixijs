import { Assets } from '~/assets';
import { HTMLTextStyle, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

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
