import { Text, TextStyle } from '~/scene';

import type { TestScene } from '../../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should keep the hidden drop shadow copy off tagged text below resolution 1',
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

        scene.addChild(
            new Text({ text: '<b>Pi</b>xi,', style, resolution: 0.25, x: 8, y: 4 }),
            new Text({ text: '<b>Pi</b>xi,', style, resolution: 0.5, x: 8, y: 68 }),
        );
    },
};
