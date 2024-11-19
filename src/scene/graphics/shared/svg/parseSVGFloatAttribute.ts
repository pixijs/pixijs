export function parseSVGFloatAttribute(svg: SVGElement, id: string, defaultValue: number): number
{
    const value = svg.getAttribute(id) as string;

    return value ? Number(value) : defaultValue;
}
