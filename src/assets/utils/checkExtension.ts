import { path } from '../../utils/path';

/**
 * @param url
 * @param extension
 * @internal
 */
export function checkExtension(url: string, extension: string | string[]): boolean
{
    const tempURL = url.split('?')[0];
    const ext = path.extname(tempURL).toLowerCase();

    if (Array.isArray(extension))
    {
        return extension.includes(ext);
    }

    return ext === extension;
}

