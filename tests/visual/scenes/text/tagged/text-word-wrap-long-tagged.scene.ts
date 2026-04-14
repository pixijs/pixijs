import { Assets } from '~/assets';
import { Graphics, Text } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should center-align tagged text correctly when words exceed wordWrapWidth',
    options: {
        width: 200,
        height: 420,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        addBlock(scene, 0, 'Long words are <em>problematic.</em>');
        addBlock(scene, 210, 'This has only <em>short</em> words.');
    },
};

function addBlock(scene: Container, y: number, str: string)
{
    const rect = new Graphics().rect(0, 0, 200, 200).fill(0x3366ff);

    rect.y = y;
    scene.addChild(rect);

    const text = new Text({
        text: str,
        style: {
            fontFamily: 'Outfit',
            fontWeight: 'bold',
            fontSize: 30,
            fill: 'white',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 100,
            tagStyles: {
                em: { fill: 'white' },
            },
        },
    });

    text.anchor.set(0.5);
    text.position.set(100, y + 100);
    scene.addChild(text);
}
