import { Shader } from '../../src/rendering/renderers/shared/shader/Shader';
import { getGlProgram } from '../utils/getGlProgram';

describe('Shader', () =>
{
    it('should create correctly', () =>
    {
        const shader = new Shader({
            glProgram: getGlProgram(),
            resources: {}
        });

        expect(shader).toBeInstanceOf(Shader);
    });

    it('should destroyed', () =>
    {
        const shader = new Shader({
            glProgram: getGlProgram(),
            resources: {}
        });

        shader.destroy();

        expect(shader.glProgram).toBeNull();
    });

    it('should destroy programs if specified', () =>
    {
        const shader = new Shader({
            glProgram: getGlProgram(),
            resources: {}
        });

        const glProgram = shader.glProgram;

        shader.destroy(true);

        expect(glProgram._attributeData).toBeNull();
    });
});
