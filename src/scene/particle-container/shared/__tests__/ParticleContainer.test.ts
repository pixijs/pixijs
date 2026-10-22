import { ParticleContainer } from '../ParticleContainer';
import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Texture } from '~/rendering';
import { Container, Particle } from '~/scene';
import { updateRenderGroupTransforms } from '~/scene/container/utils/updateRenderGroupTransforms';

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

            expect(particleContainer._gpuData).toBeEmptyObject();
        });
    });

    describe('blendMode', () =>
    {
        it('should inherit blendMode from parent container', () =>
        {
            const root = new Container({ isRenderGroup: true });

            const parent = new Container();

            parent.blendMode = 'add';

            const particleContainer = new ParticleContainer();

            root.addChild(parent);
            parent.addChild(particleContainer);

            updateRenderGroupTransforms(root.renderGroup, true);

            expect(particleContainer.groupBlendMode).toEqual('add');

            root.destroy({ children: true });
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

    describe('removeParticle', () =>
    {
        // the original per-argument indexOf + splice behaviour, used as the reference
        function referenceRemove<T>(list: T[], children: T[]): T[]
        {
            const result = list.slice();

            for (const child of children)
            {
                const index = result.indexOf(child);

                if (index > -1) result.splice(index, 1);
            }

            return result;
        }

        function makeParticles(count: number): Particle[]
        {
            const particles: Particle[] = [];

            for (let i = 0; i < count; i++)
            {
                particles.push(new Particle({ texture: Texture.WHITE, x: i }));
            }

            return particles;
        }

        it('should remove a single particle and keep the order of the rest', () =>
        {
            const particles = makeParticles(5);
            const container = new ParticleContainer({ texture: Texture.WHITE, particles: particles.slice() });

            const removed = container.removeParticle(particles[2]);

            expect(removed).toBe(particles[2]);
            expect(container.particleChildren).toEqual([particles[0], particles[1], particles[3], particles[4]]);
        });

        it.each([3, 200])('should match per-particle removal order with %i arguments', (removeCount) =>
        {
            const particles = makeParticles(500);
            // children contain duplicates, so each argument must only remove the first remaining occurrence
            const list = particles.concat(particles.slice(0, 50));
            const outsider = new Particle(Texture.WHITE);
            const children: Particle[] = [];

            for (let i = 0; i < removeCount; i++)
            {
                children.push(particles[(i * 37) % 120]);
            }

            // arguments repeat a particle and include one that is not in the container
            children.push(children[0], outsider);

            const container = new ParticleContainer({ texture: Texture.WHITE, particles: list.slice() });

            container['_childrenDirty'] = false;

            const removed = container.removeParticle(...children);

            expect(removed).toBe(children[0]);
            expect(container.particleChildren).toEqual(referenceRemove(list, children));
            expect(container['_childrenDirty']).toBe(true);
        });

        it.each([1, 200])('should not mark the container dirty when %i unknown particles are removed', (removeCount) =>
        {
            const particles = makeParticles(10);
            const container = new ParticleContainer({ texture: Texture.WHITE, particles: particles.slice() });

            container['_childrenDirty'] = false;

            container.removeParticle(...makeParticles(removeCount));

            expect(container.particleChildren).toEqual(particles);
            expect(container['_childrenDirty']).toBe(false);
        });
    });
});
