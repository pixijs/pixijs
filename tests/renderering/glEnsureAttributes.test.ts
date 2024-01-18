import { GlProgram } from '../../src/rendering/renderers/gl/shader/GlProgram';
import { ensureAttributes } from '../../src/rendering/renderers/gl/shader/program/ensureAttributes';
import { generateProgram } from '../../src/rendering/renderers/gl/shader/program/generateProgram';
import { getTestContext } from '../../src/rendering/renderers/gl/shader/program/getTestContext';
import { Buffer } from '../../src/rendering/renderers/shared/buffer/Buffer';
import { BufferUsage } from '../../src/rendering/renderers/shared/buffer/const';
import { Geometry } from '../../src/rendering/renderers/shared/geometry/Geometry';

describe('glEnsureAttributes', () =>
{
    it('should ensure attributes', async () =>
    {
        const geometry = new Geometry({
            attributes: {
                a: {
                    buffer: [1, 2, 3],
                },
                b: {
                    buffer: [1, 2, 3],
                },
            }
        });

        const program = new GlProgram({
            vertex: `
                attribute vec4 a;
                attribute vec4 b;

                varying vec4 v;

                void main() {
                    v = a + b;
                }
            `,
            fragment: `

                varying vec4 v;

                void main() {
                    gl_FragColor = v;
                }
            `,
        });

        const gl = getTestContext();

        const glProgram = generateProgram(gl, program);

        // set the program..
        gl.useProgram(glProgram.program);

        ensureAttributes(geometry, program._attributeData);

        expect(geometry.attributes.a).toMatchObject({
            location: 0,
            format: 'float32x4',
            stride: 16,
            offset: 0,
            instance: false,
            start: 0,
        });
    });

    it('should ensure interleaved attributes', async () =>
    {
        const buffer = new Buffer({
            data: new Float32Array([1, 2, 3, 4, 5, 6]),
            usage: BufferUsage.VERTEX | BufferUsage.COPY_DST
        });

        const geometry = new Geometry({
            attributes: {
                a: {
                    buffer,
                },
                b: {
                    buffer,
                },
            }
        });

        const program = new GlProgram({
            vertex: `
                attribute vec4 a;
                attribute vec2 b;

                varying vec4 v;

                void main() {
                    v = a + b.xyxy;
                }
            `,
            fragment: `
                varying vec4 v;

                void main() {
                    gl_FragColor = v;
                }
            `,
        });

        const gl = getTestContext();

        const glProgram = generateProgram(gl, program);

        // set the program..
        gl.useProgram(glProgram.program);

        ensureAttributes(geometry, program._attributeData);

        expect(geometry.attributes.a).toMatchObject({
            location: 0,
            format: 'float32x4',
            stride: 16 + 8,
            offset: 0,
            instance: false,
            start: 0,
        });

        expect(geometry.attributes.b).toMatchObject({
            location: 1,
            format: 'float32x2',
            stride: 16 + 8,
            offset: 0,
            instance: false,
            start: 16,
        });
    });
});
