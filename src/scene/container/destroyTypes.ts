/**
 * Base destroy options.
 * @example
 * // Destroy the sprite and all its children.
 * sprite.destroy({ children: true });
 * @category scene
 */
export interface BaseDestroyOptions
{
    /** Destroy children recursively. */
    children?: boolean;
}

/**
 * Options when destroying textures through .destroy() calls.
 * ```js
 * // destroy the graphics context and its texture
 * graphicsContext.destroy({ texture: true, textureSource: true });
 * ```
 * @category scene
 */
export interface TextureDestroyOptions
{
    /**
     * Destroy the texture as well.
     * @default false
     */
    texture?: boolean;
    /**
     * Destroy the texture source as well.
     * @default false
     */
    textureSource?: boolean;
}

/**
 * Options when destroying a graphics context.
 * ```js
 * // destroy the graphics context and its texture
 * graphicsContext.destroy({ context: true, texture: true, textureSource: true });
 * ```
 * @category scene
 */
export interface ContextDestroyOptions
{
    /** Destroy the graphics context as well. */
    context?: boolean;
}

/**
 * Options when destroying a text.
 * ```js
 * // destroy the text and its style
 * text.destroy({ style: true });
 * ```
 * @category scene
 */
export interface TextDestroyOptions
{
    /** Destroy the text style as well. */
    style?: boolean
}

/**
 * A utility type that allows a type to be either the specified type or a boolean.
 * This is useful for options that can be either a specific value or a boolean flag.
 * @category utils
 */
export type TypeOrBool<T> = T | boolean;

/**
 * Options for destroying a container.
 * @property {boolean} [children=false] - Destroy the children of the container as well.
 * @property {boolean} [texture=false] - Destroy the texture of the container's children.
 * @property {boolean} [textureSource=false] - Destroy the texture source of the container's children.
 * @property {boolean} [context=false] - Destroy the context of the container's children.
 * @property {boolean} [style=false] - Destroy the style of the container's children.
 * @category scene
 */
export type DestroyOptions = TypeOrBool<
BaseDestroyOptions &
ContextDestroyOptions &
TextureDestroyOptions &
TextDestroyOptions
>;
