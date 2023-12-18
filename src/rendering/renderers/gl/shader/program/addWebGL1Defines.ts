export function addWebGL1Defines(src: string, _options: any, isFragment?: boolean)
{
    if (isFragment)
    {
        src = src.replace('out vec4 finalColor;', '');

        return `
        
        #ifdef GL_ES // This checks if it's WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #else
        // WebGL2 code remains unchanged
        out vec4 finalColor;
        #endif

        ${src}
        `;
    }

    return `
        
        #ifdef GL_ES // This checks if it's WebGL1
        #define in attribute
        #define out varying
        #else
        // WebGL2 code remains unchanged
        #endif

        ${src}
        `;
}
