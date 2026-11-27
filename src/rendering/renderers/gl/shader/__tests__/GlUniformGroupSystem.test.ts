import '~/rendering/init';
import '~/scene/mesh/init';
import { Shader } from '../../../shared/shader/Shader';
import { UniformGroup } from '../../../shared/shader/UniformGroup';
import { GlProgram } from '../GlProgram';
import { getWebGLRenderer } from '@test-utils';
import { Mesh } from '~/scene/mesh/shared/Mesh';
import { MeshGeometry } from '~/scene/mesh/shared/MeshGeometry';

import type { WebGLRenderer } from '../../WebGLRenderer';

function createShader(group: UniformGroup, name = 'uniform-dirty-groups')
{
    return new Shader({
        glProgram: new GlProgram({
            name,
            vertex: `
                in vec2 aPosition;
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                }
            `,
            fragment: `
                uniform float uValue;
                out vec4 finalColor;
                void main() {
                    finalColor = vec4(uValue, 0.0, 0.0, 1.0);
                }
            `,
        }),
        resources: { testUniforms: group },
    });
}

describe.each([1, 2] as const)('GlUniformGroupSystem (WebGL %i)', (version) =>
{
    let renderer: WebGLRenderer;
    let shader: Shader;

    beforeEach(async () =>
    {
        renderer = await getWebGLRenderer({ width: 4, height: 4, preferWebGLVersion: version });

        expect(renderer.context.webGLVersion).toBe(version);
    });

    afterEach(() =>
    {
        shader?.destroy(true);
        renderer?.destroy();
    });

    it('should not retain dirty IDs for retired dynamic groups', () =>
    {
        const staticGroup = new UniformGroup({ uValue: { value: 1, type: 'f32' } }, { isStatic: true });

        shader = createShader(staticGroup);
        renderer.shader.bind(shader);

        const programData = renderer.shader._getProgramData(shader.glProgram);
        const location = renderer.gl.getUniformLocation(programData.program, 'uValue');
        const dirtyGroupCounts: number[] = [];

        for (let batch = 0; batch < 4; batch++)
        {
            for (let i = 0; i < 256; i++)
            {
                shader.resources.testUniforms = new UniformGroup({
                    uValue: { value: ((batch * 256) + i) / 1024, type: 'f32' },
                });
                renderer.shader.bind(shader);
            }

            expect(renderer.gl.getUniform(programData.program, location)).toBe(((batch * 256) + 255) / 1024);
            dirtyGroupCounts.push(Object.keys(programData.uniformDirtyGroups).length);
        }

        expect(dirtyGroupCounts).toEqual([1, 1, 1, 1]);
        expect(programData.uniformDirtyGroups).toEqual({ [staticGroup.uid]: staticGroup._dirtyId });
    });

    it('should upload dynamic values on every draw without updating the dirty ID', () =>
    {
        const group = new UniformGroup({ uValue: { value: 1, type: 'f32' } });
        const dirtyId = group._dirtyId;
        const geometry = new MeshGeometry({
            positions: new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]),
            indices: new Uint32Array([0, 1, 2, 0, 2, 3]),
        });

        shader = createShader(group);

        const mesh = new Mesh({ geometry, shader });
        const pixel = new Uint8Array(4);

        try
        {
            for (const value of [1, 0, 1])
            {
                group.uniforms.uValue = value;
                renderer.render(mesh);
                renderer.gl.readPixels(0, 0, 1, 1, renderer.gl.RGBA, renderer.gl.UNSIGNED_BYTE, pixel);

                expect(Array.from(pixel)).toEqual([value * 255, 0, 0, 255]);
                expect(group._dirtyId).toBe(dirtyId);
            }
        }
        finally
        {
            mesh.destroy();
            geometry.destroy();
        }
    });

    it('should preserve static dirty checks independently for each program', () =>
    {
        const group = new UniformGroup({ uValue: { value: 0.25, type: 'f32' } }, { isStatic: true });

        shader = createShader(group);

        const secondShader = createShader(group, 'uniform-dirty-groups-second');

        try
        {
            renderer.shader.bind(shader);

            const firstData = renderer.shader._getProgramData(shader.glProgram);
            const firstLocation = renderer.gl.getUniformLocation(firstData.program, 'uValue');

            expect(renderer.gl.getUniform(firstData.program, firstLocation)).toBe(0.25);

            group.uniforms.uValue = 0.5;
            renderer.shader.bind(shader);

            expect(renderer.gl.getUniform(firstData.program, firstLocation)).toBe(0.25);

            renderer.shader.bind(secondShader);

            const secondData = renderer.shader._getProgramData(secondShader.glProgram);
            const secondLocation = renderer.gl.getUniformLocation(secondData.program, 'uValue');

            expect(renderer.gl.getUniform(secondData.program, secondLocation)).toBe(0.5);

            group.uniforms.uValue = 1;
            group.update();
            renderer.shader.bind(secondShader);
            renderer.shader.bind(shader);

            expect(renderer.gl.getUniform(firstData.program, firstLocation)).toBe(1);
            expect(renderer.gl.getUniform(secondData.program, secondLocation)).toBe(1);
            expect(firstData.uniformDirtyGroups).toEqual({ [group.uid]: group._dirtyId });
            expect(secondData.uniformDirtyGroups).toEqual({ [group.uid]: group._dirtyId });
        }
        finally
        {
            secondShader.destroy(true);
        }
    });
});
