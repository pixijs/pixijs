import { BufferImageSource, CubeTexture, Geometry, Shader, State, Texture } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

function makeSolidTexture(r: number, g: number, b: number, a = 255): Texture
{
    return new Texture({
        source: new BufferImageSource({
            resource: new Uint8Array([r, g, b, a]),
            width: 1,
            height: 1,
            alphaMode: 'premultiply-alpha-on-upload',
        }),
    });
}

function perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number): Float32Array
{
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);

    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
}

function multiplyMat4(out: Float32Array, a: Float32Array, b: Float32Array): Float32Array
{
    const a00 = a[0];
    const a01 = a[1];
    const a02 = a[2];
    const a03 = a[3];
    const a10 = a[4];
    const a11 = a[5];
    const a12 = a[6];
    const a13 = a[7];
    const a20 = a[8];
    const a21 = a[9];
    const a22 = a[10];
    const a23 = a[11];
    const a30 = a[12];
    const a31 = a[13];
    const a32 = a[14];
    const a33 = a[15];

    const b00 = b[0];
    const b01 = b[1];
    const b02 = b[2];
    const b03 = b[3];
    const b10 = b[4];
    const b11 = b[5];
    const b12 = b[6];
    const b13 = b[7];
    const b20 = b[8];
    const b21 = b[9];
    const b22 = b[10];
    const b23 = b[11];
    const b30 = b[12];
    const b31 = b[13];
    const b32 = b[14];
    const b33 = b[15];

    out[0] = (b00 * a00) + (b01 * a10) + (b02 * a20) + (b03 * a30);
    out[1] = (b00 * a01) + (b01 * a11) + (b02 * a21) + (b03 * a31);
    out[2] = (b00 * a02) + (b01 * a12) + (b02 * a22) + (b03 * a32);
    out[3] = (b00 * a03) + (b01 * a13) + (b02 * a23) + (b03 * a33);

    out[4] = (b10 * a00) + (b11 * a10) + (b12 * a20) + (b13 * a30);
    out[5] = (b10 * a01) + (b11 * a11) + (b12 * a21) + (b13 * a31);
    out[6] = (b10 * a02) + (b11 * a12) + (b12 * a22) + (b13 * a32);
    out[7] = (b10 * a03) + (b11 * a13) + (b12 * a23) + (b13 * a33);

    out[8] = (b20 * a00) + (b21 * a10) + (b22 * a20) + (b23 * a30);
    out[9] = (b20 * a01) + (b21 * a11) + (b22 * a21) + (b23 * a31);
    out[10] = (b20 * a02) + (b21 * a12) + (b22 * a22) + (b23 * a32);
    out[11] = (b20 * a03) + (b21 * a13) + (b22 * a23) + (b23 * a33);

    out[12] = (b30 * a00) + (b31 * a10) + (b32 * a20) + (b33 * a30);
    out[13] = (b30 * a01) + (b31 * a11) + (b32 * a21) + (b33 * a31);
    out[14] = (b30 * a02) + (b31 * a12) + (b32 * a22) + (b33 * a32);
    out[15] = (b30 * a03) + (b31 * a13) + (b32 * a23) + (b33 * a33);

    return out;
}

function translation(out: Float32Array, x: number, y: number, z: number): Float32Array
{
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = x;
    out[13] = y;
    out[14] = z;
    out[15] = 1;

    return out;
}

function rotationY(out: Float32Array, rad: number): Float32Array
{
    const c = Math.cos(rad);
    const s = Math.sin(rad);

    out[0] = c;
    out[1] = 0;
    out[2] = -s;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = s;
    out[9] = 0;
    out[10] = c;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;

    return out;
}

export const scene: TestScene = {
    it: 'should sample a cube texture (samplerCube/texture_cube)',
    pixelMatch: 650,

    options: {
        depth: true,
    },
    create: async (scene: Container) =>
    {
        // Create a cube map from 6 1x1 solid textures.
        const cubeTexture = CubeTexture.from({
            faces: {
                left: makeSolidTexture(0, 255, 255), // -X cyan
                right: makeSolidTexture(255, 0, 0), // +X red
                top: makeSolidTexture(0, 255, 0), // +Y green
                bottom: makeSolidTexture(255, 0, 255), // -Y magenta
                front: makeSolidTexture(0, 0, 255), // +Z blue
                back: makeSolidTexture(255, 255, 0), // -Z yellow
            },
            label: 'debug-cube',
        });

        // Cube geometry: 6 faces * 2 triangles * 3 vertices = 36 verts.
        const positions: number[] = [];
        const normals: number[] = [];

        const pushFace = (nx: number, ny: number, nz: number, corners: number[][]) =>
        {
            // two triangles: 0-1-2, 0-2-3
            const idx = [0, 1, 2, 0, 2, 3];

            for (let i = 0; i < idx.length; i++)
            {
                const c = corners[idx[i]];

                positions.push(c[0], c[1], c[2]);
                normals.push(nx, ny, nz);
            }
        };

        const s = 0.6;

        // +X (right)
        pushFace(1, 0, 0, [[s, -s, -s], [s, -s, s], [s, s, s], [s, s, -s]]);
        // -X (left)
        pushFace(-1, 0, 0, [[-s, -s, s], [-s, -s, -s], [-s, s, -s], [-s, s, s]]);
        // +Y (top)
        pushFace(0, 1, 0, [[-s, s, -s], [s, s, -s], [s, s, s], [-s, s, s]]);
        // -Y (bottom)
        pushFace(0, -1, 0, [[-s, -s, s], [s, -s, s], [s, -s, -s], [-s, -s, -s]]);
        // +Z (front)
        pushFace(0, 0, 1, [[-s, -s, s], [-s, s, s], [s, s, s], [s, -s, s]]);
        // -Z (back)
        pushFace(0, 0, -1, [[s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, -s]]);

        const geometry = new Geometry({
            attributes: {
                aPosition: positions,
                aNormal: normals,
            },
        });

        const gl = {
            vertex: `
                in vec3 aPosition;
                in vec3 aNormal;

                out vec3 vDir;
                uniform mat4 uMVP;

                void main() {
                    vDir = aNormal;
                    gl_Position = uMVP * vec4(aPosition, 1.0);
                }
            `,
            fragment: `
                precision mediump float;

                in vec3 vDir;
                uniform samplerCube uCube;

                out vec4 finalColor;

                // GLSL100 has textureCube(); GLSL300+ uses texture().
                // Define textureCube as an alias on GLSL300+ so call sites stay clean.
                #if __VERSION__ >= 300
                #define textureCube texture
                #endif

                void main() {
                    vec3 dir = normalize(vDir);
                    finalColor = textureCube(uCube, dir);
                }
            `,
        };

        const gpu = {
            vertex: {
                entryPoint: 'main',
                source: /* wgsl */`
                    struct VertexOutput {
                        @builtin(position) position: vec4<f32>,
                        @location(0) vDir: vec3<f32>,
                    };

                    struct CubeUniforms {
                        uMVP: mat4x4<f32>,
                    };

                    @group(0) @binding(2) var<uniform> cubeUniforms : CubeUniforms;

                    @vertex
                    fn main(
                        @location(0) aPosition: vec3<f32>,
                        @location(1) aNormal: vec3<f32>,
                    ) -> VertexOutput {
                        var out: VertexOutput;
                        out.vDir = aNormal;
                        out.position = cubeUniforms.uMVP * vec4<f32>(aPosition, 1.0);
                        return out;
                    }
                `,
            },
            fragment: {
                entryPoint: 'main',
                source: /* wgsl */`
                    @group(0) @binding(0) var uCube : texture_cube<f32>;
                    @group(0) @binding(1) var uSampler : sampler;

                    @fragment
                    fn main(@location(0) vDir: vec3<f32>) -> @location(0) vec4<f32> {
                        return textureSample(uCube, uSampler, normalize(vDir));
                    }
                `,
            },
        };

        const mProj = new Float32Array(16);
        const mView = new Float32Array(16);
        const mRot = new Float32Array(16);
        const mTmp = new Float32Array(16);
        const mMVP = new Float32Array(16);

        // Fixed camera: slight rotation and pull back.
        perspective(mProj, Math.PI / 3, 1, 0.1, 100);
        translation(mView, 0, 0, -2.2);
        rotationY(mRot, 0.55);

        multiplyMat4(mTmp, mView, mRot);
        multiplyMat4(mMVP, mProj, mTmp);

        const shader = Shader.from({
            gl,
            gpu,
            resources: {
                uCube: cubeTexture.source,
                uSampler: cubeTexture.source.style,
                cubeUniforms: {
                    uMVP: { value: mMVP, type: 'mat4x4<f32>' },
                },
            },
        });

        const state = new State();

        state.blendMode = 'none';
        state.depthTest = true;
        state.depthMask = true;
        state.cullMode = 'back';

        const mesh = new Mesh({
            geometry,
            shader,
            state,
        });

        mesh.position.set(128 / 2, 128 / 2);
        scene.addChild(mesh);
    },
};

