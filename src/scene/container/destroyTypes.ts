/**
 * Base options for destroying display objects.
 * Controls how deep the destruction process should go through the display tree.
 * @example
 * ```ts
 * // Basic destruction - only this container
 * container.destroy({ children: false });
 *
 * // Deep destruction - container and all children
 * container.destroy({ children: true });
 *
 * // Cleanup pattern
 * function cleanupScene(scene: Container) {
 *     // Remove from parent first
 *     scene.parent?.removeChild(scene);
 *     // Then destroy with all children
 *     scene.destroy({ children: true });
 * }
 * ```
 * @see {@link Container#destroy} For destruction method
 * @see {@link DestroyOptions} For all destroy options
 * @category scene
 * @standard
 */
export interface BaseDestroyOptions
{
    /**
     * Whether to destroy children recursively.
     * When true, runs destroy() on all children in the display tree.
     * @default false
     * @example
     * ```js
     * container.destroy({ children: true });
     * ```
     */
    children?: boolean;
}

/**
 * Options when destroying textures through `.destroy()` calls.
 * Controls how thoroughly textures and their sources are cleaned up.
 * @example
 * ```ts
 * // Basic texture cleanup
 * sprite.destroy({
 *     texture: true
 * });
 *
 * // Complete texture cleanup
 * sprite.destroy({
 *     texture: true,
 *     textureSource: true
 * });
 * ```
 * @see {@link Container#destroy} For general destruction
 * @see {@link Texture#destroy} For texture cleanup
 * @category scene
 * @standard
 */
export interface TextureDestroyOptions
{
    /**
     * Whether to destroy the texture for the display object.
     * @default false
     * @example
     * ```js
     * texturedObject.destroy({ texture: true });
     * ```
     */
    texture?: boolean;
    /**
     * Whether to destroy the underlying texture source.
     * Use carefully with shared texture sources.
     * @default false
     * @example
     * ```js
     * texturedObject.destroy({ textureSource: true });
     * ```
     */
    textureSource?: boolean;
}

/**
 * Options when destroying a graphics context.
 * Controls the cleanup of graphics-specific resources.
 * @example
 * ```ts
 * // Basic context cleanup
 * graphics.destroy({
 *     context: true
 * });
 *
 * // Full graphics cleanup
 * graphics.destroy({
 *     context: true,
 *     texture: true,
 *     textureSource: true
 * });
 * ```
 * @see {@link Graphics#destroy} For graphics destruction
 * @see {@link DestroyOptions} For all destroy options
 * @category scene
 * @standard
 */
export interface ContextDestroyOptions
{
    /**
     * Whether to destroy the graphics context associated with the graphics object.
     * @default false
     * @example
     * ```js
     * graphics.destroy({ context: true });
     * ```
     */
    context?: boolean;
}

/**
 * Options when destroying a text object. Controls whether associated text styles
 * should be cleaned up along with the text object itself.
 * ```ts
 * // Basic text cleanup
 * text.destroy({ style: false }); // Keep style for reuse
 * text.destroy({ style: true }); // Destroy style as well
 * ```
 * @category text
 * @standard
 */
export interface TextDestroyOptions
{
    /**
     * Whether to destroy the text style object along with the text.
     * Use carefully with shared styles.
     * @default false
     */
    style?: boolean
}

/**
 * A utility type that allows a type to be either the specified type or a boolean.
 * This is useful for options that can be either a specific value or a boolean flag.
 * @category utils
 * @advanced
 */
export type TypeOrBool<T> = T | boolean;

/**
 * Options for destroying a container and its resources.
 * Combines all destroy options into a single configuration object.
 * @example
 * ```ts
 * // Destroy the container and all its children, including textures and styles
 * container.destroy({
 *     children: true,
 *     texture: true,
 *     textureSource: true,
 *     context: true,
 *     style: true
 * });
 * ```
 * @category scene
 * @standard
 */
export type DestroyOptions = TypeOrBool<
BaseDestroyOptions &
ContextDestroyOptions &
TextureDestroyOptions &
TextDestroyOptions
>;
