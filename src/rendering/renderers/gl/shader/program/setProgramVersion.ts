export function setProgramVersion(src: string, { version = '300 es' }: { version: string; })
{
    if (src.substring(0, 8) === '#version') return src;

    return `#version ${version}\n${src}`;
}
