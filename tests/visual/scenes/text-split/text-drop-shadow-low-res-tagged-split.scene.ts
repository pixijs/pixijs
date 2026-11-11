import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should keep the hidden drop shadow copy off tagged text below resolution 1 using split text',
    create: async (scene: Container) =>
    {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: 40,
            fill: 'white',
            dropShadow: { color: 'red', alpha: 1, blur: 0, distance: 6, angle: Math.PI / 4 },
            tagStyles: { b: { fill: 'yellow' } },
        });

        [[0.25, 4], [0.5, 68]].forEach(([resolution, y]) =>
        {
            const split = SplitText.from(new Text({ text: '<b>Pi</b>xi,', style }));

            split.chars.forEach((char) => { char.resolution = resolution; });
            split.position.set(8, y);
            scene.addChild(split);
        });
    },
};
