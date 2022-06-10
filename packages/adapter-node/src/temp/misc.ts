/**
 * Return font face name from a file name
 * Ex.: 'fonts/tital-one.woff' turns into 'Titan One'
 * @param url - File url
 */
export function getFontFamilyName(url: string): string
{
    const ext = extname(url);
    const name = basename(url, ext);

    // Replace dashes by white spaces
    const nameWithSpaces = name.replace(/(-|_)/g, ' ');

    // Upper case first character of each word
    const nameTitleCase = nameWithSpaces.toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return nameTitleCase;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe
= /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

function splitPath(filename: string): string[]
{
    return splitPathRe.exec(filename).slice(1);
}

export function basename(path: string, ext: string): string
{
    let f = splitPath(path)[2];

    if (ext && f.substring(-1 * ext.length) === ext)
    {
        f = f.substring(0, f.length - ext.length);
    }

    return f;
}

export function extname(path: string): string
{
    return splitPath(path)[3];
}

export function dirname(path: string): string
{
    const result = splitPath(path);
    const root = result[0];
    let dir = result[1];

    if (!root && !dir)
    {
        // No dirname whatsoever
        return '.';
    }

    if (dir)
    {
        // It has a dirname, strip trailing slash
        dir = dir.substring(0, dir.length - 1);
    }

    return root + dir;
}
