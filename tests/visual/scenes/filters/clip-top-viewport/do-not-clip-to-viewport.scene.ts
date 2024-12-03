import circleFrag from './circle.frag';
import circleVert from './circle.vert';
import circleWgsl from './circle.wgsl';
import { Assets } from '@/assets/Assets';
import { Filter } from '@/filters/Filter';
import { Sprite } from '@/scene/sprite/Sprite';

import type { TestScene } from '../../../types';
import type { Container } from '@/scene/container/Container';

export const scene: TestScene = {
    it: 'do not clip to viewport filter texture',
    create: async (scene: Container) =>
    {
        const texture = await Assets.load('chessboard.webp');
        const sprite = new Sprite({
            texture,
            width: 128,
            height: 128,
        });

        sprite.x = -64;

        const customFilter = Filter.from({
            clipToViewport: false,
            gpu: {
                vertex: {
                    source: circleWgsl,
                    entryPoint: 'mainVertex',
                },
                fragment: {
                    source: circleWgsl,
                    entryPoint: 'mainFragment',
                },
            },
            gl: {
                vertex: circleVert,
                fragment: circleFrag,
            },
        });

        sprite.filters = customFilter;

        scene.addChild(sprite);
    },
};
