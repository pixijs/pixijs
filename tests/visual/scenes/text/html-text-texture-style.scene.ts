import { TextureStyle } from '../../../../src/rendering/renderers/shared/texture/TextureStyle';
import { HTMLTextStyle, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render html-text correctly with texture style',
    create: async (scene: Container, renderer: Renderer) =>
    {
        const htmlTexture = await renderer.htmlText.getTexturePromise({
            text: 'X',
            resolution: 1,
            style: new HTMLTextStyle({
                fontSize: 18,
                fill: 'white',
                lineHeight: 15,
                letterSpacing: 6,
                align: 'center',

            }),
            textureStyle: new TextureStyle({
                scaleMode: 'nearest',
            })
        });

        const sprite = new Sprite(htmlTexture);

        sprite.scale.set(10);
        scene.addChild(sprite);
    },
};
