import { Assets } from '~/assets';
import { BitmapText, Graphics } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should center-align bitmap text correctly when words exceed wordWrapWidth',
    excludeRenderers: ['canvas'],
    options: {
        width: 200,
        height: 420,
    },
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/outfit.woff2');

        addBlock(scene, 0, 'Long words are problematic.');
        addBlock(scene, 210, 'This has only short words.');
    },
};

function addBlock(scene: Container, y: number, str: string)
{
    const rect = new Graphics().rect(0, 0, 200, 200).fill(0x3366ff);

    rect.y = y;
    scene.addChild(rect);

    const text = new BitmapText({
        text: str,
        style: {
            fontFamily: 'Outfit',
            fontWeight: 'bold',
            fontSize: 30,
            fill: 'white',
            align: 'center',
            wordWrap: true,
            wordWrapWidth: 100,
        },
    });

    text.anchor.set(0.5);
    text.position.set(100, y + 100);
    scene.addChild(text);
}
