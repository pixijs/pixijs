export function addFormats(...format: string[]): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) =>
    {
        formats.unshift(...format);

        return formats;
    };
}
export function removeFormats(...format: string[]): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) =>
    {
        for (const f of format)
        {
            const index = formats.indexOf(f);

            if (index !== -1)
            {
                formats.splice(index, 1);
            }
        }

        return formats;
    };
}
