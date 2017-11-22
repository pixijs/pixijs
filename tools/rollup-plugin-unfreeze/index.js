const MagicString = require('magic-string');

/**
 * This workaround plugin removes `Object.freeze` usage with Rollup
 * because there is no way to disable and we need it to
 * properly add deprecated methods/classes on namespaces
 * such as `PIXI.utils` or `PIXI.loaders`, code was borrowed
 * from 'rollup-plugin-replace'.
 * @todo Remove this when opt-out option for Rollup is available
 * @private
 */
export default function unfreeze()
{
    const pattern = /Object.freeze\s*\(\s*([^)]*)\)/g;

    return {
        name: 'unfreeze',
        transformBundle(code)
        {
            const str = new MagicString(code);
            let hasReplacements = false;
            let match;

            while ((match = pattern.exec(code)))
            {
                hasReplacements = true;
                const start = match.index;

                str.overwrite(
                    start,
                    start + match[0].length,
                    match[1]
                );
            }

            if (!hasReplacements)
            {
                return null;
            }

            return {
                code: str.toString(),
                map: str.generateMap({ hires: true }),
            };
        },
    };
}
