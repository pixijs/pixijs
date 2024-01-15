export function stripVersion(src: string, isES300: boolean): string
{
    if (!isES300) return src;

    return src.replace('#version 300 es', '');
}
