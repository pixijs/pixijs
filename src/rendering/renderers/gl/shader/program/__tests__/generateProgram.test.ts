import { GlProgram } from '../../GlProgram';
import { generateProgram } from '../generateProgram';
import { getTestContext } from '../getTestContext';

const fragment = `
    varying vec2 vUV;

    void main(void)
    {
        gl_FragColor = vec4(vUV, 0.0, 1.0);
    }
`;

describe('generateProgram', () =>
{
    const vertex = (declarations: string, body: string) => `
        ${declarations}
        varying vec2 vUV;

        void main(void)
        {
            vUV = ${body};
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    afterEach(() =>
    {
        jest.restoreAllMocks();
    });

    it('should link a GLSL 1.00 program once, with attributes bound in name order', () =>
    {
        const gl = getTestContext();
        const link = jest.spyOn(gl, 'linkProgram');
        const program = new GlProgram({
            vertex: vertex(
                'in vec2 aUV;\nattribute highp vec2 aPosition;\nin vec4 aColor;',
                'aUV + aColor.xy',
            ),
            fragment,
        });

        const { program: webGLProgram } = generateProgram(gl, program);

        expect(link).toHaveBeenCalledTimes(1);
        expect(program._attributeData.aColor.location).toBe(0);
        expect(program._attributeData.aPosition.location).toBe(1);
        expect(program._attributeData.aUV.location).toBe(2);

        for (const name of ['aColor', 'aPosition', 'aUV'])
        {
            expect(gl.getAttribLocation(webGLProgram, name)).toBe(program._attributeData[name].location);
        }
    });

    it('should relink to pack the locations when a declared attribute is unused', () =>
    {
        const gl = getTestContext();
        const link = jest.spyOn(gl, 'linkProgram');
        const program = new GlProgram({
            vertex: vertex('in vec2 aAUnused;\nin vec2 aPosition;\nin vec2 aUV;', 'aUV'),
            fragment,
        });

        const { program: webGLProgram } = generateProgram(gl, program);

        expect(link).toHaveBeenCalledTimes(2);
        expect(Object.keys(program._attributeData).sort()).toEqual(['aPosition', 'aUV']);
        expect(program._attributeData.aPosition.location).toBe(0);
        expect(program._attributeData.aUV.location).toBe(1);
        expect(gl.getAttribLocation(webGLProgram, 'aPosition')).toBe(0);
        expect(gl.getAttribLocation(webGLProgram, 'aUV')).toBe(1);
    });
});
