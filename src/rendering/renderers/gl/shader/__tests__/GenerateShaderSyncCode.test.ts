import { BindGroup } from '../../../gpu/shader/BindGroup';
import { GpuProgram } from '../../../gpu/shader/GpuProgram';
import { Shader } from '../../../shared/shader/Shader';
import { UniformGroup } from '../../../shared/shader/UniformGroup';
import { TextureSource } from '../../../shared/texture/sources/TextureSource';
import { generateShaderSyncCode } from '../GenerateShaderSyncCode';
import { GlProgram } from '../GlProgram';
import { getWebGLRenderer } from '@test-utils';

import type { BindResource } from '../../../gpu/shader/BindResource';
import type { WebGLRenderer } from '../../WebGLRenderer';

let renderer: WebGLRenderer;

beforeEach(async () =>
{
    // uniform blocks need WebGL2
    renderer = await getWebGLRenderer({ preferWebGLVersion: 2 });
});

afterEach(() =>
{
    renderer.destroy();
    renderer = null;
});

const wgslVertex = /* wgsl */`
    @vertex fn main(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(aPosition, 0.0, 1.0);
    }
`;

// uniform blocks need GLSL ES 3.00, which pixi only sets up when the source asks for it
const glVertex = /* glsl */`#version 300 es
    in vec2 aPosition;
    void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

/**
 * Builds a shader whose group 0 declares the given bindings, numbered in the order given.
 * @param bindings - which of the four known bindings the shader declares, in binding order
 */
function makeShader(bindings: ('tintUniforms' | 'uTexture' | 'uSampler' | 'offsetUniforms')[])
{
    const wgsl: Record<string, string> = {
        tintUniforms: 'var<uniform> tintUniforms: Tint;',
        uTexture: 'var uTexture: texture_2d<f32>;',
        uSampler: 'var uSampler: sampler;',
        offsetUniforms: 'var<uniform> offsetUniforms: Offset;',
    };
    const glsl: Record<string, string> = {
        tintUniforms: 'uniform tintUniforms { vec4 uTint; };',
        uTexture: 'uniform sampler2D uTexture;',
        uSampler: '',
        offsetUniforms: 'uniform offsetUniforms { vec2 uOffset; };',
    };
    const use: Record<string, string> = {
        tintUniforms: 'color *= tintUniforms.uTint;',
        uTexture: 'color *= textureSample(uTexture, uSampler, uv);',
        uSampler: '',
        offsetUniforms: 'uv += offsetUniforms.uOffset;',
    };
    // the offset must move the uv before the texture is sampled, whatever order the bindings are declared in
    const useOrder = ['offsetUniforms', 'uTexture', 'uSampler', 'tintUniforms'] as const;
    const useGl: Record<string, string> = {
        tintUniforms: 'color *= uTint;',
        uTexture: 'color *= texture(uTexture, uv);',
        uSampler: '',
        offsetUniforms: 'uv += uOffset;',
    };

    const gpuProgram = new GpuProgram({
        vertex: { source: wgslVertex, entryPoint: 'main' },
        fragment: {
            entryPoint: 'main',
            source: /* wgsl */`
                struct Tint { uTint: vec4<f32> }
                struct Offset { uOffset: vec2<f32> }
                ${bindings.map((name, i) => `@group(0) @binding(${i}) ${wgsl[name]}`).join('\n')}

                @fragment fn main() -> @location(0) vec4<f32> {
                    var uv = vec2<f32>(0.5);
                    var color = vec4<f32>(1.0);
                    ${useOrder.filter((name) => bindings.includes(name)).map((name) => use[name]).join('\n')}
                    return color;
                }
            `,
        },
    });

    const glProgram = new GlProgram({
        vertex: glVertex,
        fragment: /* glsl */`#version 300 es
            precision mediump float;
            ${bindings.map((name) => glsl[name]).join('\n')}
            out vec4 finalColor;

            void main() {
                vec2 uv = vec2(0.5);
                vec4 color = vec4(1.0);
                ${useOrder.filter((name) => bindings.includes(name)).map((name) => useGl[name]).join('\n')}
                finalColor = color;
            }
        `,
    });

    return { gpuProgram, glProgram };
}

function makeResources()
{
    return {
        tintUniforms: new UniformGroup({ uTint: { value: [1, 1, 1, 1], type: 'vec4<f32>' } }, { ubo: true }),
        uTexture: new TextureSource(),
        uSampler: new TextureSource().style,
        offsetUniforms: new UniformGroup({ uOffset: { value: [0, 0], type: 'vec2<f32>' } }, { ubo: true }),
    };
}

// the same resources keyed by binding number instead of name, so the group has no layout
function byNumber(resources: Record<string, BindResource>): Record<string, BindResource>
{
    return Object.fromEntries(Object.values(resources).map((resource, i) => [i, resource]));
}

// the generated function's body, with the whitespace the template literals leave behind collapsed
function syncSource(shader: Shader): string
{
    // the texture units are set on the program as a side effect of generation, so it must be bound first
    renderer.shader.bind(shader, true);

    return generateShaderSyncCode(shader, renderer.shader).toString().replace(/\s+/g, ' ');
}

describe('generateShaderSyncCode with a bind group layout', () =>
{
    it('should generate the same source as a group keyed by number when the numbering matches', () =>
    {
        const names = ['tintUniforms', 'uTexture', 'uSampler', 'offsetUniforms'] as const;
        const resources = makeResources();

        const withLayout = new Shader({
            ...makeShader([...names]),
            groups: { 0: new BindGroup(resources) },
        });
        const withoutLayout = new Shader({
            ...makeShader([...names]),
            groups: { 0: new BindGroup(byNumber(resources)) },
        });

        const source = syncSource(withLayout);

        expect(source).toContain('tS.bind(resources[1], 0)');
        expect(source).toContain(`sS.bindUniformBlock( resources[0], 'tintUniforms'`);
        expect(source).toContain(`sS.bindUniformBlock( resources[3], 'offsetUniforms'`);
        expect(source).toBe(syncSource(withoutLayout));
    });

    it('should bind by name when the shader numbers the bindings differently', () =>
    {
        // texture first, tint last, no offset: every number differs from the group's
        const shader = new Shader({
            ...makeShader(['uTexture', 'uSampler', 'tintUniforms']),
            groups: { 0: new BindGroup(makeResources()) },
        });

        const source = syncSource(shader);

        expect(source).toContain('tS.bind(resources[1], 0)');
        expect(source).toContain(`sS.bindUniformBlock( resources[0], 'tintUniforms'`);
        // the block this program never declares is left out rather than looked up
        expect(source).not.toContain('offsetUniforms');
        expect(source).not.toContain('resources[3]');
    });

    it('should skip a uniform block the program does not declare for a group keyed by number too', () =>
    {
        // the GL program lacks the block the shared group carries at binding 3
        const shader = new Shader({
            ...makeShader(['tintUniforms', 'uTexture', 'uSampler']),
            groups: { 0: new BindGroup(byNumber(makeResources())) },
        });

        expect(() => syncSource(shader)).not.toThrow();
    });
});
