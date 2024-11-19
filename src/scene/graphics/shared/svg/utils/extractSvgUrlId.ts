export function extractSvgUrlId(url: string): string
{
    // Handle all valid SVG url() formats
    const match = url.match(/url\s*\(\s*['"]?\s*#([^'"\s)]+)\s*['"]?\s*\)/i);

    return match ? match[1] : '';
}
