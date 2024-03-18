import { GlProgram } from '../../src/rendering/renderers/gl/shader/GlProgram';

export function getGlProgram()
{
    return new GlProgram({
        vertex: `
            in vec2 aPosition;
            
            void main(void)
            {
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `,

        fragment: `

            out vec4 finalColor;

            void main(void)
            {
                finalColor = vec4(1.0);
            }
        `,
    });
}
