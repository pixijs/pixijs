import { path } from '@pixi/utils';

export function checkExtension(url: string, extension: string | string[]): boolean
{
    const tempURL = url.split('?')[0];
    const ext = path.extname(tempURL).toLowerCase();

    if (Array.isArray(extension))
    {
        return extension.includes(ext.toLowerCase());
    }

    return ext.toLowerCase() === extension;
}
