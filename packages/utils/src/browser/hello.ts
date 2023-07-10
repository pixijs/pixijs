import { deprecation } from '../logging/deprecation';

/**
 * @function skipHello
 * @memberof PIXI.utils
 * @deprecated since 7.0.0
 */
export function skipHello(): void
{
    if (process.env.DEBUG)
    {
        deprecation('7.0.0', 'skipHello is deprecated, please use settings.RENDER_OPTIONS.hello');
    }
}

/**
 * @static
 * @function sayHello
 * @memberof PIXI.utils
 * @deprecated since 7.0.0
 */
export function sayHello(): void
{
    if (process.env.DEBUG)
    {
        deprecation('7.0.0', 'sayHello is deprecated, please use Renderer\'s "hello" option');
    }
}
