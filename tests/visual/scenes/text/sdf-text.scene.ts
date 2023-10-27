import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render sdf-text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/sdf/comicsdf.fnt');

        const text = new Text({
            text: 'M',
            style: {
                fontFamily: 'comicsdf',
                fontSize: 150,
                fill: 'white',
            }
        });

        text.position.set(-3, -50);
        scene.addChild(text);
    },
};
