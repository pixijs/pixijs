import { DOMAdapter } from '../../../environment/adapter';

/**
 * Resolves a font url to a base64 string
 * @param url - The url to load the font from
 * @returns - The font as a base64 string
 */
export async function loadFontAsBase64(url: string): Promise<string>
{
    const response = await DOMAdapter.get().fetch(url);

    const blob = await response.blob();

    const reader = new FileReader();

    const dataSrc: string = await new Promise((resolve, reject) =>
    {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    return dataSrc;
}
