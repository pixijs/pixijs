import { settings } from '@pixi/settings';

export async function detectWebp(): Promise<boolean>
{
    if (!globalThis.createImageBitmap) return false;

    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = await settings.ADAPTER.fetch(webpData).then((r) => r.blob());

    return createImageBitmap(blob).then(() => true, () => false);
}
