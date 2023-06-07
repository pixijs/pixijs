export function checkDataUrl(url: string, mimes: string | string[]): boolean
{
    if (Array.isArray(mimes))
    {
        for (const mime of mimes)
        {
            if (url.startsWith(`data:${mime}`)) return true;
        }

        return false;
    }

    return url.startsWith(`data:${mimes}`);
}
