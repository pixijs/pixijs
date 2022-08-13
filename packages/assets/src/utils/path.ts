function isAbsolute(path: string): boolean
{
    return path.charAt(0) === '/';
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPathRe
    = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

function splitPath(filename: string): string[]
{
    return splitPathRe.exec(filename).slice(1);
}

/**
 * Returns the last portion of a path
 * @param path - The path to get the last portion of
 * @param ext - An optional extension to add to the end of the path
 */
export function basename(path: string, ext: string): string
{
    let f = splitPath(path)[2];

    if (ext && f.substring(-1 * ext.length) === ext)
    {
        f = f.substring(0, f.length - ext.length);
    }

    return f;
}

/**
 * Returns the extension of the path, from the last occurrence of the . (period) character
 * to end of the string in the last portion of the path
 * @param path - The path to get the extension of
 */
export function extname(path: string): string
{
    return splitPath(path)[3];
}

/**
 * Joins together parts of a URL or file path.
 * @param parts - The path parts to join
 */
export function join(...parts: string[]): string
{
    let path = '';
    let protocol = '';
    const protocolDelim = '://';

    for (let i = 0; i < parts.length; i++)
    {
        const segment = parts[i];

        if (segment)
        {
            if (!path)
            {
                if (i === 0)
                {
                    // if the first part of the path has a URL protocol, extract it so it's not passed
                    // to the normalize function
                    const protocolIndex = segment.indexOf(protocolDelim);

                    if (protocolIndex !== -1)
                    {
                        const protocolEnd = protocolIndex + protocolDelim.length;

                        protocol = segment.substring(0, protocolEnd);
                        path += segment.substring(protocolEnd);

                        continue;
                    }
                }
                path += segment;
            }
            else
            {
                path += `/${segment}`;
            }
        }
    }

    return protocol + normalize(path);
}

/**
 * Returns the directory name of a path
 * @param path - The path to resolve.
 */
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

function normalize(path: string): string
{
    const _isAbsolute = isAbsolute(path);
    const trailingSlash = path && path[path.length - 1] === '/';

    // Normalize the path
    path = normalizeArray(path.split('/'), !_isAbsolute).join('/');

    if (!path && !_isAbsolute)
    {
        path = '.';
    }
    if (path && trailingSlash)
    {
        path += '/';
    }

    return (_isAbsolute ? '/' : '') + path;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts: string[], allowAboveRoot: boolean): string[]
{
    const res = [];

    for (let i = 0; i < parts.length; i++)
    {
        const p = parts[i];

        // ignore empty parts
        if (!p || p === '.')
        { continue; }

        if (p === '..')
        {
            if (res.length && res[res.length - 1] !== '..')
            {
                res.pop();
            }
            else if (allowAboveRoot)
            {
                res.push('..');
            }
        }
        else
        {
            res.push(p);
        }
    }

    return res;
}
