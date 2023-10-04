import { Text } from '../../../src/scene/text/Text';

import type { Container } from '../../../src/scene/container/Container';
import type { TestScene } from '../types';

export const scene: TestScene = {
    it: 'should render text',
    create: async (scene: Container) =>
    {
        const basicText = new Text('Basic text in pixi');

        basicText.x = 10;
        basicText.y = 20;

        scene.addChild(basicText);
    },
};
