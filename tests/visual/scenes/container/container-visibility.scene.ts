import { Texture } from '~/rendering';
import { Sprite } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

const size = 16;

// note: we're using a Sprite since a Container doesn't have a view by default
const container = (opts: {
    tint: number;
    x: number;
    y: number;
    width?: number;
    height?: number;
    alpha?: number;
    visible?: boolean;
}) =>
{
    const container = new Sprite(Texture.WHITE);

    container.tint = opts.tint;
    container.width = opts.width ?? size;
    container.height = opts.height ?? size;
    container.x = opts.x;
    container.y = opts.y;
    container.alpha = typeof opts.alpha === 'undefined' ? 1 : opts.alpha;
    container.visible = typeof opts.visible === 'undefined' ? true : opts.visible;

    return container;
};

export const scene: TestScene = {
    it: 'should render containers correctly',
    create: async (scene: Container) =>
    {
        // "should not render when object not visible"
        const notVisible = container({ tint: 0xff0000, x: 0, y: 0, visible: false });

        // "should not render when alpha is zero"
        const noAlpha = container({ tint: 0x00ffff, x: size, y: 0, alpha: 0 });

        // "should not render when object not renderable"
        const notRenderable = container({ tint: 0x0000ff, x: 0, y: size });

        notRenderable.renderable = false;

        // "should render children"
        const withChildren = container({ tint: 0x0099ff, x: size, y: size });
        const child = container({ tint: 0xff9933, x: 0.5, y: 0.5, width: 1, height: 1 });

        withChildren.addChild(child);

        // add all to scene
        scene.addChild(notVisible);
        scene.addChild(noAlpha);
        scene.addChild(notRenderable);
        scene.addChild(withChildren);
    },
};
