export async function testImageFormat(imageData: string): Promise<boolean>
{
    // Some browsers currently do not support createImageBitmap with Blob, so new Image() is preferred when exist.
    // See https://caniuse.com/createimagebitmap for more information.

    if ('Image' in globalThis)
    {
        return new Promise<boolean>((resolve) =>
        {
            const image = new Image();

            image.onload = () =>
            {
                resolve(true);
            };
            image.onerror = () =>
            {
                resolve(false);
            };
            image.src = imageData;
        });
    }

    if ('createImageBitmap' in globalThis && 'fetch' in globalThis)
    {
        try
        {
            const blob = await (await fetch(imageData)).blob();

            await createImageBitmap(blob);
        }
        catch (_e)
        {
            return false;
        }

        return true;
    }

    return false;
}
