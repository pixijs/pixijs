import { ensureAttributes } from '../ensureAttributes';
import { generateProgram } from '../generateProgram';
import { getTestContext } from '../getTestContext';
import { Buffer, BufferUsage, Geometry, GlProgram } from '~/rendering';

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

        expect(program._attributeData.a.location).toBe(0);
        expect(geometry.attributes.a).toMatchObject({
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

        expect(program._attributeData.a.location).toBe(0);
        expect(geometry.attributes.a).toMatchObject({
            format: 'float32x4',
            stride: 16 + 8,
            offset: 0,
            instance: false,
            start: 0,
        });

        expect(program._attributeData.b.location).toBe(1);
        expect(geometry.attributes.b).toMatchObject({
            format: 'float32x2',
            stride: 16 + 8,
            offset: 0,
            instance: false,
            start: 16,
        });
    });

    describe('attributes the shader does not read', () =>
    {
        function ensureWithShaderReadingOnlyA(geometry: Geometry): void
        {
            const program = new GlProgram({
                vertex: `
                    attribute vec4 a;

                    void main() {
                        gl_Position = a;
                    }
                `,
                fragment: `
                    void main() {
                        gl_FragColor = vec4(1.0);
                    }
                `,
            });

            const gl = getTestContext();
            const glProgram = generateProgram(gl, program);

            gl.useProgram(glProgram.program);

            ensureAttributes(geometry, program._attributeData);
        }

        it('should not warn when the attribute has a format', async () =>
        {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence */ });

            ensureWithShaderReadingOnlyA(new Geometry({
                attributes: {
                    a: { buffer: [1, 2, 3, 4] },
                    b: { buffer: [1, 2], format: 'float32x2' },
                }
            }));

            expect(warnSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should warn when the attribute has no format', async () =>
        {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { /* silence */ });

            ensureWithShaderReadingOnlyA(new Geometry({
                attributes: {
                    a: { buffer: [1, 2, 3, 4] },
                    b: { buffer: [1, 2] },
                }
            }));

            expect(warnSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.stringContaining('Attribute b is not present in the shader'),
            );

            warnSpy.mockRestore();
        });
    });
});
