export function addFormat(format: string): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) =>
    {
        formats.unshift(format);

        return formats;
    };
}
export function removeFormat(format: string): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) =>
    {
        formats.filter((f) => f !== format);

        return formats;
    };
}
