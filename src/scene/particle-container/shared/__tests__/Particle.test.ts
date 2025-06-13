import { Particle } from '../Particle';
import { Texture } from '~/rendering';

describe('Particle', () =>
{
    describe('tint', () =>
    {
        it('should apply number tint correctly', () =>
        {
            const particle = new Particle({
                texture: Texture.WHITE,
                tint: 0xffcc99,
            });

            expect(particle.tint).toBe(0xffcc99);
        });

        it('should apply string tint correctly', () =>
        {
            const particle = new Particle({
                texture: Texture.WHITE,
                tint: '#ffcc99',
            });

            expect(particle.tint).toBe(0xffcc99);
        });
    });
});
