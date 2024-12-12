import { Assets } from '~/assets';
import { Particle, ParticleContainer } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

export const scene: TestScene = {
    it: 'should render particle container',
    create: async (scene: Container) =>
    {
        const textures = await Assets.load([
            `bunny.png`,
            'profile-abel@2x.jpg',
        ]);

        const texture = textures[`bunny.png`];
        const texture2 = textures[`profile-abel@2x.jpg`];

        const particleContainer = new ParticleContainer();

        for (let i = 0; i < 100; i++)
        {
            const particle = new Particle(texture);

            particle.x = (i % 10) * 10;
            particle.y = ((i / 10) | 0) * 10;

            particle.rotation = i * 0.01;

            particleContainer.addParticle(particle);

            particle.alpha = i / 100;

            if (i % 2 === 0)
            {
                particle.tint = 'red';
            }
        }

        scene.addChild(particleContainer);

        const particleContainer2 = new ParticleContainer();

        const particle = new Particle(texture2);

        particle.anchorX = 0.5;
        particle.anchorY = 0.5;
        particle.x = 128 / 2;
        particle.y = 128 / 2;
        particle.scaleX = 0.6;
        particle.scaleY = 0.6;

        particleContainer2.addParticle(particle);

        scene.addChild(particleContainer2);
    },
};
