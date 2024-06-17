import { Texture } from '../../../../src/rendering/renderers/shared/texture/Texture';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { Container } from '../../../../src/scene/container/Container';
import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render swapped children correctly',
    create: async (scene: Container, renderer) =>
    {
        const createContainer = () =>
        {
            const container = new Sprite(Texture.WHITE);

            const child1 = new Sprite(Texture.WHITE);
            const child2 = new Sprite(Texture.WHITE);

            child2.tint = 0xff0000;
            child2.position.set(16, 16);
            child1.setSize(32, 32);
            child2.setSize(32, 32);

            container.addChild(child1);
            container.addChild(child2);

            scene.addChild(container);

            return container;
        };

        const container = createContainer();
        const container2 = createContainer();

        container2.position.set(32, 32);

        renderer.render(scene);

        container.swapChildren(container.children[0], container.children[1]);
        scene.swapChildren(container, container2);
    },
};
