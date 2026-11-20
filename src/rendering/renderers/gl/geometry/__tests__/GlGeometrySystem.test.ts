import { getWebGLRenderer } from '@test-utils';
import { Rectangle } from '~/maths';
import { Geometry, GlProgram, Shader } from '~/rendering';
import { Mesh } from '~/scene';

import type { WebGLRenderer } from '~/rendering';

const SIZE = 4;

const RED = [255, 0, 0, 255];
const BLUE = [0, 0, 255, 255];
const CLEAR = [0, 0, 0, 0];

function makeShader(vertex: string, fragment: string): Shader
{
    return new Shader({
        glProgram: new GlProgram({ vertex, fragment }),
        resources: {},
    });
}

function renderPixels(renderer: WebGLRenderer, mesh: Mesh): Uint8ClampedArray
{
    return renderer.extract.pixels({
        target: mesh,
        frame: new Rectangle(0, 0, SIZE, SIZE),
    }).pixels;
}

function pixelAt(pixels: Uint8ClampedArray, x: number, y: number): number[]
{
    const i = ((y * SIZE) + x) * 4;

    return Array.from(pixels.slice(i, i + 4));
}

// Attribute locations are whatever the driver assigns per program, so the same geometry
// bound to shaders that declare the attributes in a different order gets different
// locations (and a different VAO) for each program. Every combination must still draw.
describe.each([1, 2])('GlGeometrySystem attribute locations on WebGL%d', (webGLVersion) =>
{
    let renderer: WebGLRenderer;

    beforeAll(async () =>
    {
        renderer = await getWebGLRenderer({
            preferWebGLVersion: webGLVersion as 1 | 2,
            width: SIZE,
            height: SIZE,
        });

        expect(renderer.context.webGLVersion).toBe(webGLVersion);
    });

    afterAll(() =>
    {
        renderer.destroy();
    });

    it('should draw one geometry with two shaders whose attribute declaration order differs', () =>
    {
        const geometry = new Geometry({
            attributes: {
                aPosition: [-1, -1, 1, -1, 1, 1, -1, 1],
                aColor: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
            },
            indexBuffer: [0, 1, 2, 0, 2, 3],
        });

        const passThrough = `
            varying vec3 vColor;
            void main() { gl_FragColor = vec4(vColor, 1.0); }
        `;

        const positionFirst = makeShader(`
            attribute vec2 aPosition;
            attribute vec3 aColor;
            varying vec3 vColor;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vColor = aColor;
            }
        `, passThrough);

        const colorFirst = makeShader(`
            attribute vec3 aColor;
            attribute vec2 aPosition;
            varying vec3 vColor;
            void main() {
                gl_Position = vec4(aPosition, 0.0, 1.0);
                vColor = aColor.zyx;
            }
        `, passThrough);

        const meshA = new Mesh({ geometry, shader: positionFirst });
        const meshB = new Mesh({ geometry, shader: colorFirst });

        expect(pixelAt(renderPixels(renderer, meshA), 0, 0)).toEqual(RED);
        expect(pixelAt(renderPixels(renderer, meshB), 0, 0)).toEqual(BLUE);
        expect(pixelAt(renderPixels(renderer, meshA), SIZE - 1, SIZE - 1)).toEqual(RED);

        meshA.destroy();
        meshB.destroy();
        geometry.destroy();
    });

    it('should draw instanced attributes with two shaders whose attribute declaration order differs', () =>
    {
        // each instance is a full-height, one-pixel-wide column; instance 0 at x=2, instance 1 at x=0
        const geometry = new Geometry({
            attributes: {
                aPosition: [0, -1, 0.5, -1, 0.5, 1, 0, 1],
                aOffset: {
                    buffer: [0, 0, -1, 0],
                    instance: true,
                },
            },
            indexBuffer: [0, 1, 2, 0, 2, 3],
            instanceCount: 2,
        });

        const red = `void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }`;

        const positionFirst = makeShader(`
            attribute vec2 aPosition;
            attribute vec2 aOffset;
            void main() { gl_Position = vec4(aPosition + aOffset, 0.0, 1.0); }
        `, red);

        const offsetFirst = makeShader(`
            attribute vec2 aOffset;
            attribute vec2 aPosition;
            void main() { gl_Position = vec4(aPosition + aOffset, 0.0, 1.0); }
        `, red);

        for (const shader of [positionFirst, offsetFirst, positionFirst])
        {
            const mesh = new Mesh({ geometry, shader });
            const pixels = renderPixels(renderer, mesh);

            for (let y = 0; y < SIZE; y++)
            {
                expect(pixelAt(pixels, 0, y)).toEqual(RED);
                expect(pixelAt(pixels, 1, y)).toEqual(CLEAR);
                expect(pixelAt(pixels, 2, y)).toEqual(RED);
                expect(pixelAt(pixels, 3, y)).toEqual(CLEAR);
            }

            mesh.destroy();
        }

        geometry.destroy();
    });
});
