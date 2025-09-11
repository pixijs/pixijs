import { Container, Text } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render two text correctly with the same style and value',
    create: async (scene: Container, renderer) =>
    {
        let container = new Container();

        let text = new Text({
            text: 'Hello 1',
            style: {
                fill: '#FFC700',
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }
        });

        container.addChild(text);

        let text2 = new Text({
            text: 'Hello 2',
            style: {
                fill: 'green',
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold'
            },
            y: 40
        });

        container.addChild(text2);
        scene.addChild(container);

        renderer.render(scene);
        container.destroy({ children: true });

        container = new Container();

        text = new Text({
            text: 'World1',
            style: {
                fill: '#FFC700',
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }
        });

        container.addChild(text);

        text2 = new Text({
            text: 'World2',
            style: {
                fill: 'green',
                fontSize: 32,
                fontFamily: 'Arial',
                fontWeight: 'bold'
            },
            y: 40
        });

        container.addChild(text2);
        scene.addChild(container);
    },
};
