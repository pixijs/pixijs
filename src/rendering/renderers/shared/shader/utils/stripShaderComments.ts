/**
 * Removes `//` and `/* *\/` comments from GLSL or WGSL source, so a parser doesn't read
 * declarations that are commented out.
 *
 * One pass with both kinds, so a `//` inside a block comment (`/* see https://... *\/`) is part of the
 * block rather than a line comment that eats the block's closing `*\/`.
 * @param source - the shader source
 * @returns the source without comments
 * @internal
 */
export function stripShaderComments(source: string): string
{
    return source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
}
