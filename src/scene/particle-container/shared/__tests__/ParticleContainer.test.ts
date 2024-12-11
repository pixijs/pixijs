import { ParticleContainer } from '../ParticleContainer';
import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Container, Particle } from '~/scene';

describe('ParticleContainer', () =>
{
    describe('constructor', () =>
    {
        it('should support no arguments', () =>
        {
            const container = new ParticleContainer();

            expect(container).toBeDefined();
            expect(container.texture).toEqual(null);

            container.destroy();
        });

        it('should support options with no texture', () =>
        {
            const container = new ParticleContainer({
                texture: Texture.WHITE,
            });

            expect(container).toBeDefined();
            expect(container.texture).toEqual(Texture.WHITE);

            container.destroy();
        });
    });

    describe('destroy', () =>
    {
        it('should not throw when destroyed', () =>
        {
            const container = new ParticleContainer();

            expect(() => container.destroy()).not.toThrow();
        });

        it('should clean up correctly on the pipe and system when destroyed', async () =>
        {
            const renderer = await getWebGLRenderer();

            const container = new Container();

            const particleContainer = new ParticleContainer();

            particleContainer.addParticle(new Particle({
                texture: Texture.WHITE
            }));

            container.addChild(particleContainer);

            renderer.render({ container });

            particleContainer.destroy();

            expect(renderer.renderPipes.particle['_gpuBufferHash'][particleContainer.uid]).toBeNull();
        });
    });

    describe('width', () =>
    {
        it('should set width correctly if no bounds is set', () =>
        {
            const container = new ParticleContainer();

            container.width = 100;

            // this should be 0 as no bounds have been specified
            expect(container.width).toEqual(0);
        });

        it('should set bounds on the constructor', () =>
        {
            const container = new ParticleContainer({
                texture: Texture.WHITE,
                boundsArea: new Rectangle(0, 0, 50, 100),
            });

            expect(container.width).toEqual(50);
            expect(container.height).toEqual(100);

            container.width = 100;
            expect(container.width).toEqual(100);
        });
    });
});
