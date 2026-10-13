/**
 * Resolves after the given number of milliseconds.
 * @param ms - The delay in milliseconds.
 */
export function wait(ms: number): Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nextTick(): Promise<void>
{
    return wait(0);
}
