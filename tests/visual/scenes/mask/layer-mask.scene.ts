import { Container, Graphics } from '~/scene';

import type { TestScene } from '../../types';

export const scene: TestScene = {
    it: 'should render masks if they have multiple layers correctly',
    create: async (scene: Container) =>
    {
        const wrapper = new Container();

        const width = 128 - 20;
        const height = 128 - 20;
        const border = 4;
        const radius = 4;

        const bg = new Graphics()
            .roundRect(0, 0, width, height, radius + border)
            .fill(0xffffff)
            .roundRect(border, border, width - (border * 2), height - (border * 2), radius)
            .fill(0x0000ff);

        wrapper.x = 10;
        wrapper.y = 10;

        const mask = new Graphics()
            .roundRect(0, 0, width, height, radius + border)
            .fill(0xff0000)
            .roundRect(border, border, width - (border * 2), height - (border * 2), radius)
            .fill(0xffffff);

        const thingOutSideofMask = new Graphics()
            .rect(0, 0, 1000, 20)
            .fill(0x00ff00);

        //   mask.y =100;
        wrapper.addChild(mask, bg, thingOutSideofMask);
        wrapper.mask = mask;

        scene.addChild(wrapper);
    },
};
