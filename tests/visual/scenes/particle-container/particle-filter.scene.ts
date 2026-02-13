import { Assets } from '~/assets';
import { ColorMatrixFilter } from '~/filters';
import { Rectangle } from '~/maths';
import { Particle, ParticleContainer } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render particle container with filter and filterArea',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const texture = await Assets.load(`bunny.png`);

        const particleContainer = new ParticleContainer();

        particleContainer.x = 30;
        particleContainer.y = 30;

        for (let i = 0; i < 9; i++)
        {
            const particle = new Particle(texture);

            particle.x = (i % 3) * 20;
            particle.y = ((i / 3) | 0) * 20;

            particleContainer.addParticle(particle);
        }

        const filter = new ColorMatrixFilter();

        filter.hue(90, true);

        particleContainer.filterArea = new Rectangle(30, 30, 80, 80);
        particleContainer.filters = [filter];

        scene.addChild(particleContainer);
    },
};
