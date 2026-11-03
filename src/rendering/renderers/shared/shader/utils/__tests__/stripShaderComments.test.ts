import { stripShaderComments } from '../stripShaderComments';

describe('stripShaderComments', () =>
{
    it('removes line and block comments', () =>
    {
        const source = `
            // a line comment
            out vec4 color; // trailing
            /* a block
               comment */ out vec4 velocity;
        `;

        expect(stripShaderComments(source).replace(/\s+/g, ' ').trim()).toBe('out vec4 color; out vec4 velocity;');
    });

    it('keeps the code between two block comments when the first holds a //', () =>
    {
        const source = `
            /* see https://example.com */
            layout(location = 1) out vec4 velocity;
            /* tail */
            void main() {}
        `;

        expect(stripShaderComments(source)).toContain('layout(location = 1) out vec4 velocity;');
        expect(stripShaderComments(source)).toContain('void main() {}');
    });

    it('treats a /* inside a line comment as part of the line', () =>
    {
        const source = `
            // opens /* but never closes
            out vec4 color;
        `;

        expect(stripShaderComments(source)).toContain('out vec4 color;');
    });
});
