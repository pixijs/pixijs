import { DOMAdapter } from '../environment/adapter';

function assertPath(path: string)
{
    if (typeof path !== 'string')
    {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}

function removeUrlParams(url: string): string
{
    const re = url.split('?')[0];

    return re.split('#')[0];
}

function escapeRegExp(string: string)
{
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string)
{
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path: string, allowAboveRoot: boolean)
{
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = -1;

    for (let i = 0; i <= path.length; ++i)
    {
        if (i < path.length)
        {
            code = path.charCodeAt(i);
        }
        else if (code === 47)
        {
            break;
        }
        else
        {
            code = 47;
        }
        if (code === 47)
        {
            if (lastSlash === i - 1 || dots === 1)
            {
                // NOOP
            }
            else if (lastSlash !== i - 1 && dots === 2)
            {
                if (
                    res.length < 2
                    || lastSegmentLength !== 2
                    || res.charCodeAt(res.length - 1) !== 46
                    || res.charCodeAt(res.length - 2) !== 46
                )
                {
                    if (res.length > 2)
                    {
                        const lastSlashIndex = res.lastIndexOf('/');

                        if (lastSlashIndex !== res.length - 1)
                        {
                            if (lastSlashIndex === -1)
                            {
                                res = '';
                                lastSegmentLength = 0;
                            }
                            else
                            {
                                res = res.slice(0, lastSlashIndex);
                                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
                            }
                            lastSlash = i;
                            dots = 0;
                            continue;
                        }
                    }
                    else if (res.length === 2 || res.length === 1)
                    {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot)
                {
                    if (res.length > 0)
                    { res += '/..'; }
                    else
                    { res = '..'; }
                    lastSegmentLength = 2;
                }
            }
            else
            {
                if (res.length > 0)
                {
                    res += `/${path.slice(lastSlash + 1, i)}`;
                }
                else
                {
                    res = path.slice(lastSlash + 1, i);
                }
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        }
        else if (code === 46 && dots !== -1)
        {
            ++dots;
        }
        else
        {
            dots = -1;
        }
    }

    return res;
}

/**
 * Path utilities for working with URLs and file paths in a cross-platform way.
 * All paths that are passed in will become normalized to have posix separators.
 * ```js
 * import { path } from 'pixi.js';
 *
 * path.normalize('http://www.example.com/foo/bar/../baz'); // http://www.example.com/foo/baz
 * ```
 * @memberof utils
 */
export interface Path
{
    /**
     * Converts a path to posix format.
     * @param path - The path to convert to posix
     */
    toPosix: (path: string) => string;
    /**
     * Checks if the path is a URL e.g. http://, https://
     * @param path - The path to check
     */
    isUrl: (path: string) => boolean;
    /**
     * Checks if the path is a data URL
     * @param path - The path to check
     */
    isDataUrl: (path: string) => boolean;
    /**
     * Checks if the path is a blob URL
     * @param path - The path to check
     */
    isBlobUrl: (path: string) => boolean;
    /**
     * Checks if the path has a protocol e.g. http://, https://, file:///, data:, blob:, C:/
     * This will return true for windows file paths
     * @param path - The path to check
     */
    hasProtocol: (path: string) => boolean;
    /**
     * Returns the protocol of the path e.g. http://, https://, file:///, data:, blob:, C:/
     * @param path - The path to get the protocol from
     */
    getProtocol: (path: string) => string;
    /**
     * Converts URL to an absolute path.
     * When loading from a Web Worker, we must use absolute paths.
     * If the URL is already absolute we return it as is
     * If it's not, we convert it
     * @param url - The URL to test
     * @param customBaseUrl - The base URL to use
     * @param customRootUrl - The root URL to use
     */
    toAbsolute: (url: string, baseUrl?: string, rootUrl?: string) => string;
    /**
     * Normalizes the given path, resolving '..' and '.' segments
     * @param path - The path to normalize
     */
    normalize: (path: string) => string;
    /**
     * Determines if path is an absolute path.
     * Absolute paths can be urls, data urls, or paths on disk
     * @param path - The path to test
     */
    isAbsolute: (path: string) => boolean;
    /**
     * Joins all given path segments together using the platform-specific separator as a delimiter,
     * then normalizes the resulting path
     * @param segments - The segments of the path to join
     */
    join: (...paths: string[]) => string;
    /**
     * Returns the directory name of a path
     * @param path - The path to parse
     */
    dirname: (path: string) => string;
    /**
     * Returns the root of the path e.g. /, C:/, file:///, http://domain.com/
     * @param path - The path to parse
     */
    rootname: (path: string) => string;
    /**
     * Returns the last portion of a path
     * @param path - The path to test
     * @param ext - Optional extension to remove
     */
    basename: (path: string, ext?: string) => string;
    /**
     * Returns the extension of the path, from the last occurrence of the . (period) character to end of string in the last
     * portion of the path. If there is no . in the last portion of the path, or if there are no . characters other than
     * the first character of the basename of path, an empty string is returned.
     * @param path - The path to parse
     */
    extname: (path: string) => string;
    /**
     * Parses a path into an object containing the 'root', `dir`, `base`, `ext`, and `name` properties.
     * @param path - The path to parse
     */
    parse: (path: string) => { root?: string, dir?: string, base?: string, ext?: string, name?: string };
    sep: string,
    delimiter: string,
    joinExtensions: string[],
}

/**
 * Path utilities for working with URLs and file paths in a cross-platform way.
 * All paths that are passed in will become normalized to have posix separators.
 * ```js
 * import { path } from 'pixi.js';
 *
 * path.normalize('http://www.example.com/foo/bar/../baz'); // http://www.example.com/foo/baz
 * ```
 * @see {@link utils.Path}
 * @memberof utils
 */
export const path: Path = {
    /**
     * Converts a path to posix format.
     * @param path - The path to convert to posix
     */
    toPosix(path: string) { return replaceAll(path, '\\', '/'); },
    /**
     * Checks if the path is a URL e.g. http://, https://
     * @param path - The path to check
     */
    isUrl(path: string) { return (/^https?:/).test(this.toPosix(path)); },
    /**
     * Checks if the path is a data URL
     * @param path - The path to check
     */
    isDataUrl(path: string)
    {
        // eslint-disable-next-line max-len
        return (/^data:([a-z]+\/[a-z0-9-+.]+(;[a-z0-9-.!#$%*+.{}|~`]+=[a-z0-9-.!#$%*+.{}()_|~`]+)*)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s<>]*?)$/i)
            .test(path);
    },
    /**
     * Checks if the path is a blob URL
     * @param path - The path to check
     */
    isBlobUrl(path: string)
    {
        // Not necessary to have an exact regex to match the blob URLs
        return path.startsWith('blob:');
    },
    /**
     * Checks if the path has a protocol e.g. http://, https://, file:///, data:, blob:, C:/
     * This will return true for windows file paths
     * @param path - The path to check
     */
    hasProtocol(path: string) { return (/^[^/:]+:/).test(this.toPosix(path)); },
    /**
     * Returns the protocol of the path e.g. http://, https://, file:///, data:, blob:, C:/
     * @param path - The path to get the protocol from
     */
    getProtocol(path: string)
    {
        assertPath(path);
        path = this.toPosix(path);

        const matchFile = (/^file:\/\/\//).exec(path);

        if (matchFile)
        {
            return matchFile[0];
        }

        const matchProtocol = (/^[^/:]+:\/{0,2}/).exec(path);

        if (matchProtocol)
        {
            return matchProtocol[0];
        }

        return '';
    },

    /**
     * Converts URL to an absolute path.
     * When loading from a Web Worker, we must use absolute paths.
     * If the URL is already absolute we return it as is
     * If it's not, we convert it
     * @param url - The URL to test
     * @param customBaseUrl - The base URL to use
     * @param customRootUrl - The root URL to use
     */
    toAbsolute(url: string, customBaseUrl?: string, customRootUrl?: string)
    {
        assertPath(url);

        if (this.isDataUrl(url) || this.isBlobUrl(url)) return url;

        const baseUrl = removeUrlParams(this.toPosix(customBaseUrl ?? DOMAdapter.get().getBaseUrl()));
        const rootUrl = removeUrlParams(this.toPosix(customRootUrl ?? this.rootname(baseUrl)));

        url = this.toPosix(url);

        // root relative url
        if (url.startsWith('/'))
        {
            return path.join(rootUrl, url.slice(1));
        }

        const absolutePath = this.isAbsolute(url) ? url : this.join(baseUrl, url);

        return absolutePath;
    },

    /**
     * Normalizes the given path, resolving '..' and '.' segments
     * @param path - The path to normalize
     */
    normalize(path: string)
    {
        assertPath(path);

        if (path.length === 0) return '.';
        if (this.isDataUrl(path) || this.isBlobUrl(path)) return path;

        path = this.toPosix(path);

        let protocol = '';
        const isAbsolute = path.startsWith('/');

        if (this.hasProtocol(path))
        {
            protocol = this.rootname(path);
            path = path.slice(protocol.length);
        }

        const trailingSeparator = path.endsWith('/');

        // Normalize the path
        path = normalizeStringPosix(path, false);

        if (path.length > 0 && trailingSeparator) path += '/';
        if (isAbsolute) return `/${path}`;

        return protocol + path;
    },

    /**
     * Determines if path is an absolute path.
     * Absolute paths can be urls, data urls, or paths on disk
     * @param path - The path to test
     */
    isAbsolute(path: string)
    {
        assertPath(path);
        path = this.toPosix(path);

        if (this.hasProtocol(path)) return true;

        return path.startsWith('/');
    },

    /**
     * Joins all given path segments together using the platform-specific separator as a delimiter,
     * then normalizes the resulting path
     * @param segments - The segments of the path to join
     */
    join(...segments: string[])
    {
        if (segments.length === 0)
        { return '.'; }
        let joined;

        for (let i = 0; i < segments.length; ++i)
        {
            const arg = segments[i];

            assertPath(arg);
            if (arg.length > 0)
            {
                if (joined === undefined) joined = arg;
                else
                {
                    const prevArg = segments[i - 1] ?? '';

                    if (this.joinExtensions.includes(this.extname(prevArg).toLowerCase()))
                    {
                        joined += `/../${arg}`;
                    }
                    else
                    {
                        joined += `/${arg}`;
                    }
                }
            }
        }
        if (joined === undefined) { return '.'; }

        return this.normalize(joined);
    },

    /**
     * Returns the directory name of a path
     * @param path - The path to parse
     */
    dirname(path: string)
    {
        assertPath(path);
        if (path.length === 0) return '.';
        path = this.toPosix(path);
        let code = path.charCodeAt(0);
        const hasRoot = code === 47;
        let end = -1;
        let matchedSlash = true;

        const proto = this.getProtocol(path);
        const origpath = path;

        path = path.slice(proto.length);

        for (let i = path.length - 1; i >= 1; --i)
        {
            code = path.charCodeAt(i);
            if (code === 47)
            {
                if (!matchedSlash)
                {
                    end = i;
                    break;
                }
            }
            else
            {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }

        // if end is -1 and its a url then we need to add the path back
        // eslint-disable-next-line no-nested-ternary
        if (end === -1) return hasRoot ? '/' : this.isUrl(origpath) ? proto + path : proto;
        if (hasRoot && end === 1) return '//';

        return proto + path.slice(0, end);
    },

    /**
     * Returns the root of the path e.g. /, C:/, file:///, http://domain.com/
     * @param path - The path to parse
     */
    rootname(path: string)
    {
        assertPath(path);
        path = this.toPosix(path);

        let root = '';

        if (path.startsWith('/')) root = '/';
        else
        {
            root = this.getProtocol(path);
        }

        if (this.isUrl(path))
        {
            // need to find the first path separator
            const index = path.indexOf('/', root.length);

            if (index !== -1)
            {
                root = path.slice(0, index);
            }
            else root = path;

            if (!root.endsWith('/')) root += '/';
        }

        return root;
    },

    /**
     * Returns the last portion of a path
     * @param path - The path to test
     * @param ext - Optional extension to remove
     */
    basename(path: string, ext?: string)
    {
        assertPath(path);
        if (ext) assertPath(ext);

        path = removeUrlParams(this.toPosix(path));

        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i: number;

        if (ext !== undefined && ext.length > 0 && ext.length <= path.length)
        {
            if (ext.length === path.length && ext === path) return '';
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;

            for (i = path.length - 1; i >= 0; --i)
            {
                const code = path.charCodeAt(i);

                if (code === 47)
                {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash)
                    {
                        start = i + 1;
                        break;
                    }
                }
                else
                {
                    if (firstNonSlashEnd === -1)
                    {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0)
                    {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx))
                        {
                            if (--extIdx === -1)
                            {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else
                        {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }

            if (start === end) end = firstNonSlashEnd; else if (end === -1) end = path.length;

            return path.slice(start, end);
        }
        for (i = path.length - 1; i >= 0; --i)
        {
            if (path.charCodeAt(i) === 47)
            {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash)
                {
                    start = i + 1;
                    break;
                }
            }
            else if (end === -1)
            {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }

        if (end === -1) return '';

        return path.slice(start, end);
    },

    /**
     * Returns the extension of the path, from the last occurrence of the . (period) character to end of string in the last
     * portion of the path. If there is no . in the last portion of the path, or if there are no . characters other than
     * the first character of the basename of path, an empty string is returned.
     * @param path - The path to parse
     */
    extname(path: string)
    {
        assertPath(path);
        path = removeUrlParams(this.toPosix(path));

        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;

        for (let i = path.length - 1; i >= 0; --i)
        {
            const code = path.charCodeAt(i);

            if (code === 47)
            {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash)
                {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1)
            {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46)
            {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            }
            else if (startDot !== -1)
            {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }

        if (
            startDot === -1 || end === -1
            // We saw a non-dot character immediately before the dot
            || preDotState === 0
            // The (right-most) trimmed path component is exactly '..'
            // eslint-disable-next-line no-mixed-operators/no-mixed-operators
            || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1
        )
        {
            return '';
        }

        return path.slice(startDot, end);
    },

    /**
     * Parses a path into an object containing the 'root', `dir`, `base`, `ext`, and `name` properties.
     * @param path - The path to parse
     */
    parse(path: string)
    {
        assertPath(path);

        const ret = { root: '', dir: '', base: '', ext: '', name: '' };

        if (path.length === 0) return ret;
        path = removeUrlParams(this.toPosix(path));

        let code = path.charCodeAt(0);
        const isAbsolute = this.isAbsolute(path);
        let start: number;
        const protocol = '';

        ret.root = this.rootname(path);

        if (isAbsolute || this.hasProtocol(path))
        {
            start = 1;
        }
        else
        {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;

        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;

        // Get non-dir info
        for (; i >= start; --i)
        {
            code = path.charCodeAt(i);
            if (code === 47)
            {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash)
                {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1)
            {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === 46)
            {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) startDot = i;
                else if (preDotState !== 1) preDotState = 1;
            }
            else if (startDot !== -1)
            {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }

        if (
            startDot === -1 || end === -1
            // We saw a non-dot character immediately before the dot
            || preDotState === 0
            // The (right-most) trimmed path component is exactly '..'
            // eslint-disable-next-line no-mixed-operators/no-mixed-operators
            || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1
        )
        {
            if (end !== -1)
            {
                if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);
                else ret.base = ret.name = path.slice(startPart, end);
            }
        }
        else
        {
            if (startPart === 0 && isAbsolute)
            {
                ret.name = path.slice(1, startDot);
                ret.base = path.slice(1, end);
            }
            else
            {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
            }
            ret.ext = path.slice(startDot, end);
        }

        ret.dir = this.dirname(path);
        if (protocol) ret.dir = protocol + ret.dir;

        return ret;
    },

    sep: '/',
    delimiter: ':',
    joinExtensions: ['.html'],
} as Path;
