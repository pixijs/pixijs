import { Shader } from '../shared/shader/Shader';
import { getGlProgram } from '@test-utils';

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

    it('_groupKeyCache should re-enumerate groups after addResource inserts a new group', () =>
    {
        const shader = new Shader({
            glProgram: getGlProgram(),
            resources: {}
        });

        // warm the cache with an empty group map
        expect(shader._groupKeyCache).toEqual([]);

        shader.addResource('uFoo', 0, 0);

        // the new group must be visible — the cache was invalidated rather than reused
        expect(shader._groupKeyCache).toEqual([0]);
    });

    it('destroy should clear the group key cache', () =>
    {
        const shader = new Shader({
            glProgram: getGlProgram(),
            resources: {}
        });

        shader.addResource('uFoo', 0, 0);

        expect(shader._groupKeyCache).toEqual([0]);

        shader.destroy();

        expect(shader.groups).toBeNull();
        expect(shader._groupKeyCache).toEqual([]);
    });
});
