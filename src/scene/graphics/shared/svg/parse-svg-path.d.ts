declare module 'parse-svg-path'
{
    export type Command = [string, ...number[]];
    export default function parse(path: string): Command[];
}
