import { extname } from './misc';

/** simple loader plugin for loading json data */
export const loadJSON = {
    test(url: string): boolean
    {
        return (extname(url).includes('.json'));
    },

    async load<T>(url: string): Promise<T>
    {
        const response = await fetch(url);

        const json = await response.json();

        return json as T;
    },
};

