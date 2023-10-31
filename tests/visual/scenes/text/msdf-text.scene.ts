import { Assets } from '../../../../src/assets/Assets';
import { Text } from '../../../../src/scene/text/Text';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render msdf-text correctly',
    create: async (scene: Container) =>
    {
        await Assets.load('fonts/msdf/comicmsdf.fnt');

        const text = new Text({
            text: 'M',
            style: {
                fontFamily: 'comicmsdf',
                fontSize: 150,
                fill: 'white',
            }
        });

        text.position.set(-3, -50);
        scene.addChild(text);
    },
};
