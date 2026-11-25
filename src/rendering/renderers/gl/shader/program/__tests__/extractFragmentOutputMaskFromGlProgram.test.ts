import { extractFragmentOutputMaskFromGlProgram } from '../extractFragmentOutputMaskFromGlProgram';

describe('extractFragmentOutputMaskFromGlProgram', () =>
{
    it('treats a GLSL ES 1.00 shader as writing location 0 (gl_FragColor)', () =>
    {
        expect(extractFragmentOutputMaskFromGlProgram('void main() { gl_FragColor = vec4(1.0); }')).toBe(0b1);
    });

    it('treats a lone output without a layout as location 0', () =>
    {
        const fragment = `#version 300 es
            precision mediump float;
            out vec4 finalColor;
            void main() { finalColor = vec4(1.0); }
        `;

        expect(extractFragmentOutputMaskFromGlProgram(fragment)).toBe(0b1);
    });

    it('reads layout locations, precision qualifiers and arrays, and ignores out parameters', () =>
    {
        const fragment = `#version 300 es
            precision highp float;
            layout(location = 0) out vec4 color;
            layout( location=1 ) out highp vec2 velocity;
            // layout(location = 2) out vec4 commented;
            layout(location = 3) out uvec4 ids[2];

            void write(out vec4 c) { c = vec4(1.0); }
            void main() { write(color); }
        `;

        // locations 0, 1, and 3 + 4 for the array
        expect(extractFragmentOutputMaskFromGlProgram(fragment)).toBe(0b11011);
    });

    it('returns null when a GLSL ES 3.00 shader has no output it can read, so every attachment stays written', () =>
    {
        const fragment = `#version 300 es
            precision mediump float;
            out vec4 color, velocity;
            void main() { color = vec4(1.0); velocity = vec4(0.0); }
        `;

        expect(extractFragmentOutputMaskFromGlProgram(fragment)).toBeNull();
    });

    it('treats a GLSL ES 1.00 shader that writes gl_FragData as unknown', () =>
    {
        const fragment = `
            #extension GL_EXT_draw_buffers : require
            void main() { gl_FragData[0] = vec4(1.0); gl_FragData[1] = vec4(0.0); }
        `;

        expect(extractFragmentOutputMaskFromGlProgram(fragment)).toBeNull();
    });

    it('treats a GLSL ES 3.00 shader with no out at all as writing no color', () =>
    {
        const fragment = `#version 300 es
            precision mediump float;
            void main() { }
        `;

        expect(extractFragmentOutputMaskFromGlProgram(fragment)).toBe(0);
    });
});
