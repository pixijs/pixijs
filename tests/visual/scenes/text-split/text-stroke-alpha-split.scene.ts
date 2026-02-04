import { SplitText, Text, TextStyle } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render stroke and fill alpha separately using split text',
    create: async (scene: Container) =>
    {
        const style = new TextStyle({
            fill: 'rgba(255, 0, 0, 0.25)',
            fontSize: 64,
            stroke: {
                width: 4,
            }
        });

        const text1 = new Text({ text: 'Hi', style });
        const split1 = SplitText.from(text1);

        split1.position.set(0, 0);

        scene.addChild(split1);
    },
};
