export function insertVersion(src: string, isES300: boolean): string
{
    if (!isES300) return src;

    return `#version 300 es\n${src}`;
}
