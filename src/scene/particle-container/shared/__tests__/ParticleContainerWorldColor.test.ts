import { ParticleContainer } from '../ParticleContainer';
import { getWebGLRenderer } from '@test-utils';
import { Texture } from '~/rendering';
import { Container, Particle } from '~/scene';

describe('ParticleContainer world color and alpha', () =>
{
    const renderWithAncestor = async (apply: (root: Container) => void) =>
    {
        const renderer = await getWebGLRenderer();

        const root = new Container({ isRenderGroup: true });
        const inner = new Container({ isRenderGroup: true });
        const particles = new ParticleContainer({ texture: Texture.WHITE });

        particles.addParticle(new Particle({ texture: Texture.WHITE }));
        inner.addChild(particles);
        root.addChild(inner);

        apply(root);

        renderer.render(root);

        return (renderer.renderPipes as unknown as {
            particle: { localUniforms: { uniforms: { uColor: Float32Array } } };
        }).particle.localUniforms.uniforms.uColor;
    };

    it('should apply the alpha of an ancestor render group', async () =>
    {
        const uColor = await renderWithAncestor((root) =>
        {
            root.alpha = 0.5;
        });

        expect(uColor[3]).toBeCloseTo(0.5, 2);
    });

    it('should apply the tint of an ancestor render group', async () =>
    {
        const uColor = await renderWithAncestor((root) =>
        {
            root.tint = 0xff0000;
        });

        // premultiplied red: green and blue are removed
        expect(uColor[0]).toBeCloseTo(1, 2);
        expect(uColor[1]).toBeCloseTo(0, 2);
        expect(uColor[2]).toBeCloseTo(0, 2);
        expect(uColor[3]).toBeCloseTo(1, 2);
    });

    it('should leave the color untouched when no ancestor tint or alpha is set', async () =>
    {
        const uColor = await renderWithAncestor(() => { /* no ancestor color */ });

        expect(uColor[0]).toBeCloseTo(1, 2);
        expect(uColor[1]).toBeCloseTo(1, 2);
        expect(uColor[2]).toBeCloseTo(1, 2);
        expect(uColor[3]).toBeCloseTo(1, 2);
    });
});
