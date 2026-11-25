import { CubeTexture, CubeTextureSource, Geometry, RenderTarget, Shader, State } from '~/rendering';
import { Container, Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Renderer } from '~/rendering';

// one color per face, in layer order: +X, -X, +Y, -Y, +Z, -Z
const FACE_COLORS = [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 1, 0, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
];

const solidWgsl = /* wgsl */`
    struct FaceUniforms {
        uFaceColor: vec4<f32>,
        uDepth: f32,
    }

    @group(0) @binding(0) var<uniform> faceUniforms : FaceUniforms;

    @vertex
    fn vsMain(@location(0) aPosition : vec2<f32>) -> @builtin(position) vec4<f32> {
        return vec4<f32>(aPosition, faceUniforms.uDepth, 1.0);
    }

    @fragment
    fn fsMain() -> @location(0) vec4<f32> {
        return faceUniforms.uFaceColor;
    }
`;

const solidGl = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        uniform float uDepth;
        void main() {
            gl_Position = vec4(aPosition, uDepth, 1.0);
        }
    `,
    fragment: `#version 300 es
        precision highp float;
        uniform vec4 uFaceColor;
        out vec4 fragColor;
        void main() {
            fragColor = uFaceColor;
        }
    `,
};

const sampleWgsl = /* wgsl */`
    @group(0) @binding(0) var uCube : texture_cube<f32>;
    @group(0) @binding(1) var uSampler : sampler;

    struct VSOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) uv: vec2<f32>,
    };

    @vertex
    fn vsMain(@location(0) aPosition: vec2<f32>, @location(1) aUV: vec2<f32>) -> VSOutput {
        var out: VSOutput;
        out.position = vec4<f32>(aPosition, 0.0, 1.0);
        out.uv = aUV;
        return out;
    }

    @fragment
    fn fsMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
        // 3 x 2 tiles, one face each in layer order
        let cell = uv * vec2<f32>(3.0, 2.0);
        let face = i32(floor(cell.x)) + 3 * i32(floor(cell.y));
        let st = fract(cell) * 2.0 - 1.0;

        var dir = vec3<f32>(-st.x, -st.y, -1.0);

        switch face {
            case 0: { dir = vec3<f32>(1.0, -st.y, -st.x); }
            case 1: { dir = vec3<f32>(-1.0, -st.y, st.x); }
            case 2: { dir = vec3<f32>(st.x, 1.0, st.y); }
            case 3: { dir = vec3<f32>(st.x, -1.0, -st.y); }
            case 4: { dir = vec3<f32>(st.x, -st.y, 1.0); }
            default: {}
        }

        return textureSampleLevel(uCube, uSampler, dir, 0.0);
    }
`;

const sampleGl = {
    vertex: `#version 300 es
        precision highp float;
        in vec2 aPosition;
        in vec2 aUV;
        out vec2 vUV;
        void main() {
            vUV = aUV;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `,
    fragment: `#version 300 es
        precision highp float;
        precision highp samplerCube;
        in vec2 vUV;
        uniform samplerCube uCube;
        out vec4 fragColor;

        vec3 faceDirection(int face, vec2 st) {
            if (face == 0) return vec3(1.0, -st.y, -st.x);
            if (face == 1) return vec3(-1.0, -st.y, st.x);
            if (face == 2) return vec3(st.x, 1.0, st.y);
            if (face == 3) return vec3(st.x, -1.0, -st.y);
            if (face == 4) return vec3(st.x, -st.y, 1.0);
            return vec3(-st.x, -st.y, -1.0);
        }

        void main() {
            vec2 cell = vUV * vec2(3.0, 2.0);
            int face = int(floor(cell.x)) + 3 * int(floor(cell.y));
            fragColor = textureLod(uCube, faceDirection(face, fract(cell) * 2.0 - 1.0), 0.0);
        }
    `,
};

function solidQuad(color: number[], depth: number, halfSize: number, state: State): Mesh<Geometry, Shader>
{
    const h = halfSize;

    return new Mesh({
        geometry: new Geometry({ attributes: { aPosition: [-h, -h, h, -h, h, h, -h, -h, h, h, -h, h] } }),
        shader: Shader.from({
            gl: solidGl,
            gpu: {
                vertex: { source: solidWgsl, entryPoint: 'vsMain' },
                fragment: { source: solidWgsl, entryPoint: 'fsMain' },
            },
            resources: {
                faceUniforms: {
                    uFaceColor: { value: color, type: 'vec4<f32>' },
                    uDepth: { value: depth, type: 'f32' },
                },
            },
        }),
        state,
    });
}

export const scene: TestScene = {
    it: 'should render each face of an empty CubeTextureSource with depth and sample it as a CubeTexture',
    renderers: ['webgpu', 'webgl2'],
    create: async (scene: Container, renderer: Renderer) =>
    {
        const cubeSource = new CubeTextureSource({ width: 32, height: 32 });
        const target = new RenderTarget({ colorTextures: [cubeSource], depth: true });

        const depthState = new State();

        depthState.blendMode = 'none';
        depthState.depthTest = true;
        depthState.depthMask = true;

        for (let layer = 0; layer < 6; layer++)
        {
            const face = new Container();

            // near white square first; the depth test then keeps the far face color out of it
            face.addChild(solidQuad([1, 1, 1, 1], 0.2, 0.5, depthState));
            face.addChild(solidQuad(FACE_COLORS[layer], 0.8, 1, depthState));

            renderer.render({ container: face, target, clear: true, clearColor: [0, 0, 0, 1], layer });
        }

        const cube = new CubeTexture({ source: cubeSource });

        scene.addChild(new Mesh({
            geometry: new Geometry({
                attributes: {
                    aPosition: [-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1],
                    aUV: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
                },
            }),
            shader: Shader.from({
                gl: sampleGl,
                gpu: {
                    vertex: { source: sampleWgsl, entryPoint: 'vsMain' },
                    fragment: { source: sampleWgsl, entryPoint: 'fsMain' },
                },
                resources: {
                    uCube: cube.source,
                    uSampler: cube.source.style,
                },
            }),
        }));
    },
};
