export function checkExtension(url: string, extension: string | string[]): boolean
{
    const tempURL = url.split('?')[0];
    const extensionSplit = tempURL.split('.').pop();

    if (Array.isArray(extension))
    {
        return extension.includes(extensionSplit.toLowerCase());
    }

    return extensionSplit.toLowerCase() === extension;
}
