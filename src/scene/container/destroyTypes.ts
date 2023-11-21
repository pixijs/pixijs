/**
 * Base destroy options.
 * @memberof scene
 */
export interface BaseDestroyOptions
{
    /** Destroy children recursively. */
    children?: boolean;
}

/**
 * Texture destroy options.
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
