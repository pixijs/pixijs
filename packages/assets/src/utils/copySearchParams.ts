/**
 * Copies the search params from one url to another
 * @param targetUrl - the url to copy the search params to
 * @param sourceUrl - the url container the search params we want to copy
 * @returns the url with the search params copied
 */
export const copySearchParams = (targetUrl: string, sourceUrl: string) =>
{
    const searchParams = sourceUrl.split('?')[1];

    if (searchParams)
    {
        targetUrl += `?${searchParams}`;
    }

    return targetUrl;
};
