/**
 * Base destroy options.
 * @example
 * // Destroy the sprite and all its children.
 * sprite.destroy({ children: true });
 * @memberof scene
 */
export interface BaseDestroyOptions
{
    /** Destroy children recursively. */
    children?: boolean;
}

/**
 * Options when destroying textures. Most of these use cases are internal.
 * ```js
 * // destroy the graphics context and its texture
 * graphicsContext.destroy({ texture: true });
 * ```
 * @memberof scene
 */
export interface TextureDestroyOptions
{
    /** Destroy the texture as well. */
    texture?: boolean;
    /** Destroy the texture source as well. */
    textureSource?: boolean;
}

export interface ContextDestroyOptions
{
    context?: boolean;
}

export interface ViewSystemDestroyOptions
{
    removeView?: boolean;
}

export type TypeOrBool<T> = T | boolean;

export type DestroyOptions = TypeOrBool<
BaseDestroyOptions &
ContextDestroyOptions &
TextureDestroyOptions &
ViewSystemDestroyOptions
>;
