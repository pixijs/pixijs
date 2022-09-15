export function addFormats(...format: string[]): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) => [...formats, ...format];
}
export function removeFormats(...format: string[]): (formats: string[]) => Promise<string[]>
{
    return async (formats: string[]) => formats.filter((f) => !format.includes(f));
}
