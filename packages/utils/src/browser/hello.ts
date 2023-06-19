import { deprecation } from '../logging/deprecation';

/**
 * @function skipHello
 * @memberof PIXI.utils
 * @deprecated since 7.0.0
 */
export function skipHello(): void
{
    // #if _DEBUG
    deprecation('7.0.0', 'skipHello is deprecated, please use settings.RENDER_OPTIONS.hello');
    // #endif
}

/**
 * @static
 * @function sayHello
 * @memberof PIXI.utils
 * @deprecated since 7.0.0
 */
export function sayHello(): void
{
    // #if _DEBUG
    deprecation('7.0.0', 'sayHello is deprecated, please use Renderer\'s "hello" option');
    // #endif
}
