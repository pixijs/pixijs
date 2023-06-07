const fragmentNameCache: { [key: string]: number } = {};
const VertexNameCache: { [key: string]: number } = {};

export function setProgramName(src: string, { name = `pixi-program` }: { name: string; }, isFragment = true)
{
    name = name.replace(/\s+/g, '-');

    name += isFragment ? '-fragment' : '-vertex';

    const nameCache = isFragment ? fragmentNameCache : VertexNameCache;

    if (nameCache[name])
    {
        nameCache[name]++;
        name += `-${nameCache[name]}`;
    }
    else
    {
        nameCache[name] = 1;
    }

    // if it already contains the define return
    if (src.indexOf('#define SHADER_NAME') !== -1) return src;

    const shaderName = `#define SHADER_NAME ${name}`;

    if (src.substring(0, 8) !== '#version')
    {
        return `${shaderName}\n${src}`;
    }

    // get the first line break in the src
    const firstLineBreak = src.indexOf('\n');

    // insert the precision statement after the first line
    return `${src.substring(0, firstLineBreak + 1)}${shaderName}\n${src.substring(firstLineBreak + 1)}`;
}
