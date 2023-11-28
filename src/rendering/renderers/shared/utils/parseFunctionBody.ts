export function parseFunctionBody(fn: (...args: any[]) => any): string
{
    const fnStr = fn.toString();
    const bodyStart = fnStr.indexOf('{');
    const bodyEnd = fnStr.lastIndexOf('}');

    if (bodyStart === -1 || bodyEnd === -1)
    {
        throw new Error('getFunctionBody: No body found in function definition');
    }

    return fnStr.slice(bodyStart + 1, bodyEnd).trim();
}
