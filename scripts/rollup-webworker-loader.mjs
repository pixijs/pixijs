import webworkerLoader from './webworker-loader.js';

const regex = /.*\.worker\.ts/;

export default function myExample()
{
    return {
        name: '@pixi/webworker-loader/rollup-plugin',
        transform(code, id)
        {
            if (!regex.test(id))
            {
                return null;
            }

            code = webworkerLoader.generateCode(code, 'esm');

            return { code, map: null };
        }
    };
}
