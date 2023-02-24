import { promises } from 'fs';

/**
 * Read JSON file using async
 * @param file
 */
const readJSON = async <T = any>(file: string): Promise<T> => JSON.parse(await promises.readFile(file, 'utf8')) as T;

/**
 * Write JSON file using async
 * @param file
 * @param data
 */
const writeJSON = (file: string, data: any) => promises.writeFile(file, `${JSON.stringify(data, null, 2)}\n`);

export { readJSON, writeJSON };
