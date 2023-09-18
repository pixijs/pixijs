/**
 * formats a shader so its more pleasant to read!
 * @param shader - a glsl shader program source
 */
export function formatShader(shader: string): string
{
    const spl = shader.split(/([\n{}])/g)
        .map((a) => a.trim())
        .filter((a) => a.length);

    let indent = '';

    const formatted = spl.map((a) =>
    {
        let indentedLine = indent + a;

        if (a === '{')
        {
            indent += '    ';
        }
        else if (a === '}')
        {
            indent = indent.substr(0, indent.length - 4);

            indentedLine = indent + a;
        }

        return indentedLine;
    }).join('\n');

    return formatted;
}

