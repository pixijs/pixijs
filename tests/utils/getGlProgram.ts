import { GlProgram } from '../../src/rendering/renderers/gl/shader/GlProgram';

export function getGlProgram()
{
    return new GlProgram({
        vertex: `
            
            in vec2 aVertexPosition;
            
            void main(void)
            {
                gl_Position = vec4(aVertexPosition, 0.0, 1.0);
            }
        `,

        fragment: `

            out vec4 fragColor;

            void main(void)
            {
                fragColor = vec4(1.0);
            }
        `,
    });
}
