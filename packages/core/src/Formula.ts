export type SetupFn<T = any> = (term: T) => unknown[];

export function Formula<R = any, T = any, E = unknown>(setup: SetupFn<T>): (term: T, run: R) => E
{
    return (term: T, run: R): E => (run as any)(...setup(term));
}
