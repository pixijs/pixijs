import { Geometry, Shader, State } from '~/rendering';
import { Mesh } from '~/scene';

import type { TestScene } from '../../types';
import type { Container } from '~/scene';

const CELL = 64;

const vertex = `
in vec2 aPosition;

uniform mat3 uProjectionMatrix;
uniform mat3 uWorldTransformMatrix;
uniform mat3 uTransformMatrix;

void main() {
    mat3 mvp = uProjectionMatrix * uWorldTransformMatrix * uTransformMatrix;
    gl_Position = vec4((mvp * vec3(aPosition, 1.0)).xy, 0.0, 1.0);
}
`;

const fragment = `
void main() {
    gl_FragColor = gl_FrontFacing
        ? vec4(0.24, 0.78, 0.35, 1.0)
        : vec4(0.90, 0.24, 0.28, 1.0);
}
`;

const wgsl = /* wgsl */`
struct GlobalUniforms {
    uProjectionMatrix: mat3x3<f32>,
    uWorldTransformMatrix: mat3x3<f32>,
    uWorldColorAlpha: vec4<f32>,
    uResolution: vec2<f32>,
}

struct LocalUniforms {
    uTransformMatrix: mat3x3<f32>,
    uColor: vec4<f32>,
    uRound: f32,
}

@group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
@group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;

@vertex
fn mainVert(@location(0) aPosition: vec2<f32>) -> @builtin(position) vec4<f32> {
    let mvp = globalUniforms.uProjectionMatrix
        * globalUniforms.uWorldTransformMatrix
        * localUniforms.uTransformMatrix;

    return vec4<f32>(mvp * vec3<f32>(aPosition, 1.0), 1.0);
}

@fragment
fn mainFrag(@builtin(front_facing) frontFacing: bool) -> @location(0) vec4<f32> {
    if (frontFacing) {
        return vec4<f32>(0.24, 0.78, 0.35, 1.0);
    }

    return vec4<f32>(0.90, 0.24, 0.28, 1.0);
}
`;

interface Cell
{
    x: number;
    y: number;
    reverseWinding: boolean;
    clockwiseFrontFace: boolean;
    culling: boolean;
}

/**
 * Each cell fills a quadrant with a quad that is green when the rasteriser calls it front-facing
 * and red when it calls it back-facing, so both backends must agree on the winding, not just on
 * which triangles survive culling. Expected output, left to right, top to bottom:
 * green, background (culled), red, green.
 */
const cells: Cell[] = [
    { x: 0, y: 0, reverseWinding: false, clockwiseFrontFace: false, culling: true },
    { x: CELL, y: 0, reverseWinding: false, clockwiseFrontFace: true, culling: true },
    { x: 0, y: CELL, reverseWinding: false, clockwiseFrontFace: true, culling: false },
    { x: CELL, y: CELL, reverseWinding: true, clockwiseFrontFace: true, culling: false },
];

export const scene: TestScene = {
    it: 'should agree on front-facing winding across renderers',
    excludeRenderers: ['canvas'],
    create: async (scene: Container) =>
    {
        const shader = Shader.from({
            gl: { vertex, fragment, name: 'front-facing' },
            gpu: {
                name: 'front-facing',
                vertex: { source: wgsl, entryPoint: 'mainVert' },
                fragment: { source: wgsl, entryPoint: 'mainFrag' },
            },
        });

        for (const cell of cells)
        {
            const geometry = new Geometry({
                attributes: { aPosition: [0, 0, 0, CELL, CELL, CELL, CELL, 0] },
                indexBuffer: cell.reverseWinding ? [2, 1, 0, 3, 2, 0] : [0, 1, 2, 0, 2, 3],
            });

            const state = State.for2d();

            state.culling = cell.culling;
            state.clockwiseFrontFace = cell.clockwiseFrontFace;

            const mesh = new Mesh({ geometry, shader, state });

            mesh.position.set(cell.x, cell.y);

            scene.addChild(mesh);
        }
    },
};
