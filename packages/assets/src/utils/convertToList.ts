export const convertToList = <T>(input: string | T | (string | T)[], transform?: (input: string) => T): T[] =>
{
    if (!Array.isArray(input))
    {
        input = [input as T];
    }

    if (!transform)
    {
        return input as T[];
    }

    return (input as (string | T)[]).map((item): T =>
    {
        if (typeof item === 'string')
        {
            return transform(item as string);
        }

        return item as T;
    });
};
