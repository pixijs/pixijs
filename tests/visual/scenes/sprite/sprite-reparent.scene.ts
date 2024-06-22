import { Assets } from '../../../../src/assets/Assets';
import { Container } from '../../../../src/scene/container/Container';
import { Sprite } from '../../../../src/scene/sprite/Sprite';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should reparent a sprite',
    create: async (scene: Container, renderer) =>
    {
        await Assets.load('bunny.png');

        const parent = new Container();
        const newParent = new Container();
        const child = Sprite.from(`bunny.png`);
        const child2 = Sprite.from(`bunny.png`);
        const child3 = Sprite.from(`bunny.png`);

        child3.y = 50;
        child3.scale = 1.5;

        newParent.position.x = 100;
        newParent.scale.set(2);
        newParent.rotation = Math.PI / 4;

        newParent.addChild(child2);
        parent.addChild(child);
        scene.addChild(parent, newParent, child3);

        // render scene
        renderer.render(scene);

        newParent.reparentChild(child);
        newParent.reparentChildAt(child3, 0);
    },
};
