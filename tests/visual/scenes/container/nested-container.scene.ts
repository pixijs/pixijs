import { AlphaFilter } from '~/filters';
import { getCanvasTexture } from '~/rendering';
import { Graphics, Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

const canvas = document.createElement('canvas');

canvas.width = 32;
canvas.height = 32;

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 32, 32);

const redTexture = getCanvasTexture(canvas);

function createHierarchy(scene: Container)
{
    const root = new Sprite(redTexture);
    const child1 = new Sprite(redTexture);
    const child2 = new Sprite(redTexture);

    root.width = root.height = 16;
    child1.position.set(1, 1);
    child2.position.set(1, 1);

    root.addChild(child1);
    child1.addChild(child2);

    scene.addChild(root);

    return [root, child1, child2];
}

export const scene: TestScene = {
    it: 'should render nested containers',
    // skip: true,
    create: async (scene: Container) =>
    {
        // Nested w/ scale/transforms
        const [rootA] = createHierarchy(scene);

        rootA.scale.set(32, 5);

        // Nested w/ opacity, Nested w/ tinting
        const [rootB] = createHierarchy(scene);

        rootB.tint = 0xff0000;
        rootB.alpha = 0.5;

        // Nested w/ masking with Graphics
        const [rootC] = createHierarchy(scene);
        const mask1 = new Graphics().circle(0, 16, 35).fill();

        rootC.tint = 0x00ff00;
        rootC.y = 16;
        rootC.mask = mask1;

        // Nested w/ masking with sprite mask
        const [rootD] = createHierarchy(scene);

        const mask2 = new Sprite(redTexture);

        rootD.position.set(32, 32);
        mask2.position.set(32, 32);
        mask2.width = mask2.height = 32;
        rootD.mask = mask2;

        // Custom pivot point
        const [rootE] = createHierarchy(scene);

        rootE.position.set(64, 64);
        rootE.pivot.set(2, 2);
        rootE.angle = 45;

        // Nested w/ custom pivot points
        const [rootF, childF1, childF2] = createHierarchy(scene);

        rootF.tint = 0x0000ff;
        rootF.position.set(64, 140);
        rootF.pivot.set(2, 2);
        rootF.angle = 45;
        childF1.pivot.set(2, 2);
        childF1.angle = 45;
        childF2.pivot.set(2, 2);
        childF2.angle = 45;

        // Nested w/ AlphaFilter on root
        const [rootG] = createHierarchy(scene);

        rootG.position.set(30, 40);
        rootG.scale.set(20);
        rootG.tint = 0x00ffff;
        rootG.filters = [new AlphaFilter({ alpha: 0.5 })];

        // scene.addChild(rootG, )
    },
};
