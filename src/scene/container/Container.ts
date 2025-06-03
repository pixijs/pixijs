import EventEmitter from 'eventemitter3';
import { Color, type ColorSource } from '../../color/Color';
import { cullingMixin } from '../../culling/cullingMixin';
import { extensions } from '../../extensions/Extensions';
import { Matrix } from '../../maths/matrix/Matrix';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../maths/misc/const';
import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { uid } from '../../utils/data/uid';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { BigPool } from '../../utils/pool/PoolGroup';
import { type IRenderLayer } from '../layers/RenderLayer';
import { cacheAsTextureMixin } from './container-mixins/cacheAsTextureMixin';
import { childrenHelperMixin } from './container-mixins/childrenHelperMixin';
import { collectRenderablesMixin } from './container-mixins/collectRenderablesMixin';
import { effectsMixin } from './container-mixins/effectsMixin';
import { findMixin } from './container-mixins/findMixin';
import { getFastGlobalBoundsMixin } from './container-mixins/getFastGlobalBoundsMixin';
import { bgr2rgb, getGlobalMixin } from './container-mixins/getGlobalMixin';
import { measureMixin } from './container-mixins/measureMixin';
import { onRenderMixin } from './container-mixins/onRenderMixin';
import { sortMixin } from './container-mixins/sortMixin';
import { toLocalGlobalMixin } from './container-mixins/toLocalGlobalMixin';
import { RenderGroup } from './RenderGroup';
import { assignWithIgnore } from './utils/assignWithIgnore';

import type { Size } from '../../maths/misc/Size';
import type { PointData } from '../../maths/point/PointData';
import type { Rectangle } from '../../maths/shapes/Rectangle';
import type { BLEND_MODES } from '../../rendering/renderers/shared/state/const';
import type { Dict } from '../../utils/types';
import type { Optional } from './container-mixins/measureMixin';
import type { DestroyOptions } from './destroyTypes';

/**
 * The type of child that can be added to a {@link Container}.
 * This is a generic type that extends the {@link Container} class.
 * @category scene
 * @standard
 */
export type ContainerChild = Container;

// as pivot and skew are the least used properties of a container, we can use this optimisation
// to avoid allocating lots of unnecessary objects for them.
const defaultSkew = new ObservablePoint(null);
const defaultPivot = new ObservablePoint(null);
const defaultScale = new ObservablePoint(null, 1, 1);

/**
 * Events that can be emitted by a Container. These events provide lifecycle hooks and notifications
 * for container state changes.
 * @example
 * ```ts
 * import { Container, Sprite } from 'pixi.js';
 *
 * // Setup container with event listeners
 * const container = new Container();
 *
 * // Listen for child additions
 * container.on('childAdded', (child, container, index) => {
 *     console.log(`Child added at index ${index}:`, child);
 * });
 *
 * // Listen for child removals
 * container.on('childRemoved', (child, container, index) => {
 *     console.log(`Child removed from index ${index}:`, child);
 * });
 *
 * // Listen for when container is added to parent
 * container.on('added', (parent) => {
 *     console.log('Added to parent:', parent);
 * });
 *
 * // Listen for when container is removed from parent
 * container.on('removed', (parent) => {
 *     console.log('Removed from parent:', parent);
 * });
 *
 * // Listen for container destruction
 * container.on('destroyed', (container) => {
 *     console.log('Container destroyed:', container);
 * });
 * ```
 * @category scene
 * @standard
 */
export interface ContainerEvents<C extends ContainerChild> extends PixiMixins.ContainerEvents
{
    /**
     * Emitted when this container is added to a new container.
     * Useful for setting up parent-specific behaviors.
     * @param container - The parent container this was added to
     * @example
     * ```ts
     * const child = new Container();
     * child.on('added', (parent) => {
     *     console.log('Child added to parent:', parent.label);
     * });
     * parentContainer.addChild(child);
     * ```
     */
    added: [container: Container];

    /**
     * Emitted when a child is added to this container.
     * Useful for tracking container composition changes.
     * @param child - The child that was added
     * @param container - The container the child was added to (this container)
     * @param index - The index at which the child was added
     * @example
     * ```ts
     * const parent = new Container();
     * parent.on('childAdded', (child, container, index) => {
     *     console.log(`New child at index ${index}:`, child);
     * });
     * ```
     */
    childAdded: [child: C, container: Container, index: number];

    /**
     * Emitted when this container is removed from its parent.
     * Useful for cleanup and state management.
     * @param container - The parent container this was removed from
     * @example
     * ```ts
     * const child = new Container();
     * child.on('removed', (oldParent) => {
     *     console.log('Child removed from parent:', oldParent.label);
     * });
     * ```
     */
    removed: [container: Container];

    /**
     * Emitted when a child is removed from this container.
     * Useful for cleanup and maintaining container state.
     * @param child - The child that was removed
     * @param container - The container the child was removed from (this container)
     * @param index - The index from which the child was removed
     * @example
     * ```ts
     * const parent = new Container();
     * parent.on('childRemoved', (child, container, index) => {
     *     console.log(`Child removed from index ${index}:`, child);
     * });
     * ```
     */
    childRemoved: [child: C, container: Container, index: number];

    /**
     * Emitted when the container is destroyed.
     * Useful for final cleanup and resource management.
     * @param container - The container that was destroyed
     * @example
     * ```ts
     * const container = new Container();
     * container.on('destroyed', (container) => {
     *     console.log('Container destroyed:', container.label);
     * });
     * ```
     */
    destroyed: [container: Container];
}

type AnyEvent = {
    // The following is a hack to allow any custom event while maintaining type safety.
    // For some reason, the tsc compiler gets angry about error TS1023
    // "An index signature parameter type must be either 'string' or 'number'."
    // This is really odd since ({}&string) should interpret as string, but then again
    // there is some black magic behind why this works in the first place.
    // Closest thing to an explanation:
    // https://stackoverflow.com/questions/70144348/why-does-a-union-of-type-literals-and-string-cause-ide-code-completion-wh
    //
    // Side note, we disable @typescript-eslint/ban-types since {}&string is the only syntax that works.
    // Nor of the Record/unknown/never alternatives work.
    [K: ({} & string) | ({} & symbol)]: any;
};

/** @internal */
export const UPDATE_COLOR = 0b0001;
/** @internal */
export const UPDATE_BLEND = 0b0010;
/** @internal */
export const UPDATE_VISIBLE = 0b0100;
/** @internal */
export const UPDATE_TRANSFORM = 0b1000;

/**
 * Options for updating the transform of a container.
 * @category scene
 * @standard
 */
export interface UpdateTransformOptions
{
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    skewX: number;
    skewY: number;
    pivotX: number;
    pivotY: number;
}

/**
 * Constructor options used for `Container` instances.
 * ```js
 * const container = new Container({
 *    position: new Point(100, 200),
 *    scale: new Point(2, 2),
 *    rotation: Math.PI / 2,
 * });
 * ```
 * @category scene
 * @standard
 * @see Container
 */
export interface ContainerOptions<C extends ContainerChild = ContainerChild> extends PixiMixins.ContainerOptions
{
    /** @see Container#isRenderGroup */
    isRenderGroup?: boolean;

    /**
     * The blend mode to be applied to the sprite. Controls how pixels are blended when rendering.
     *
     * Setting to 'normal' will reset to default blending.
     * > [!NOTE] More blend modes are available after importing the `pixi.js/advanced-blend-modes` sub-export.
     * @example
     * ```ts
     * // Basic blend modes
     * new Container({ blendMode: 'normal' }); // Default blending
     * new Container({ blendMode: 'add' });    // Additive blending
     * new Container({ blendMode: 'multiply' }); // Multiply colors
     * new Container({ blendMode: 'screen' }); // Screen blend
     * ```
     * @default 'normal'
     * @see {@link Container#alpha} For transparency
     * @see {@link Container#tint} For color adjustments
     */
    blendMode?: BLEND_MODES;
    /**
     * The tint applied to the sprite.
     *
     * This can be any valid {@link ColorSource}.
     * @example
     * ```ts
     * new Container({ tint: 0xff0000 }); // Red tint
     * new Container({ tint: 'blue' }); // Blue tint
     * new Container({ tint: '#00ff00' }); // Green tint
     * new Container({ tint: 'rgb(0,0,255)' }); // Blue tint
     * ```
     * @default 0xFFFFFF
     * @see {@link Container#alpha} For transparency
     * @see {@link Container#visible} For visibility control
     */
    tint?: ColorSource;

    /**
     * The opacity of the object relative to its parent's opacity.
     * Value ranges from 0 (fully transparent) to 1 (fully opaque).
     * @example
     * ```ts
     * new Container({ alpha: 0.5 }); // 50% opacity
     * new Container({ alpha: 1 }); // Fully opaque
     * ```
     * @default 1
     * @see {@link Container#visible} For toggling visibility
     * @see {@link Container#renderable} For render control
     */
    alpha?: number;
    /**
     * The angle of the object in degrees.
     *
     * > [!NOTE] 'rotation' and 'angle' have the same effect on a display object;
     * > rotation is in radians, angle is in degrees.
     @example
     * ```ts
     * new Container({ angle: 45 }); // Rotate 45 degrees
     * new Container({ angle: 90 }); // Rotate 90 degrees
     * ```
     */
    angle?: number;
    /**
     * The array of children of this container. Each child must be a Container or extend from it.
     *
     * The array is read-only, but its contents can be modified using Container methods.
     * @example
     * ```ts
     * new Container({
     *    children: [
     *        new Container(), // First child
     *        new Container(), // Second child
     *    ],
     * });
     * ```
     * @readonly
     * @see {@link Container#addChild} For adding children
     * @see {@link Container#removeChild} For removing children
     */
    children?: C[];
    /**
     * The display object container that contains this display object.
     * This represents the parent-child relationship in the display tree.
     * @readonly
     * @see {@link Container#addChild} For adding to a parent
     * @see {@link Container#removeChild} For removing from parent
     */
    parent?: Container;
    /**
     * Controls whether this object can be rendered. If false the object will not be drawn,
     * but the transform will still be updated. This is different from visible, which skips
     * transform updates.
     * @example
     * ```ts
     * new Container({ renderable: false }); // Will not be drawn, but transforms will update
     * ```
     * @default true
     * @see {@link Container#visible} For skipping transform updates
     * @see {@link Container#alpha} For transparency
     */
    renderable?: boolean;
    /**
     * The rotation of the object in radians.
     *
     * > [!NOTE] 'rotation' and 'angle' have the same effect on a display object;
     * > rotation is in radians, angle is in degrees.
     * @example
     * ```ts
     * new Container({ rotation: Math.PI / 4 }); // Rotate 45 degrees
     * new Container({ rotation: Math.PI / 2 }); // Rotate 90 degrees
     * ```
     */
    rotation?: number;
    /**
     * The scale factors of this object along the local coordinate axes.
     *
     * The default scale is (1, 1).
     * @example
     * ```ts
     * new Container({ scale: new Point(2, 2) }); // Scale by 2x
     * new Container({ scale: 0.5 }); // Scale by 0.5x
     * new Container({ scale: { x: 1.5, y: 1.5 } }); // Scale by 1.5x
     * ```
     */
    scale?: PointData | number;
    /**
     * The center of rotation, scaling, and skewing for this display object in its local space.
     * The `position` is the projection of `pivot` in the parent's local space.
     *
     * By default, the pivot is the origin (0, 0).
     * @example
     * ```ts
     * new Container({ pivot: new Point(100, 200) }); // Set pivot to (100, 200)
     * new Container({ pivot: 50 }); // Set pivot to (50, 50)
     * new Container({ pivot: { x: 150, y: 150 } }); // Set pivot to (150, 150)
     * ```
     */
    pivot?: PointData | number;
    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * @example
     * ```ts
     * new Container({ position: new Point(100, 200) }); // Set position to (100, 200)
     * new Container({ position: { x: 150, y: 150 } }); // Set position to (150, 150)
     * ```
     */
    position?: PointData;
    /**
     * The skew factor for the object in radians. Skewing is a transformation that distorts
     * the object by rotating it differently at each point, creating a non-uniform shape.
     * @example
     * ```ts
     * new Container({ skew: new Point(0.1, 0.2) }); // Skew by 0.1 radians on x and 0.2 radians on y
     * new Container({ skew: { x: 0.1, y: 0.2 } }); // Skew by 0.1 radians on x and 0.2 radians on y
     * ```
     * @default { x: 0, y: 0 }
     */
    skew?: PointData;
    /**
     * The visibility of the object. If false the object will not be drawn,
     * and the transform will not be updated.
     * @example
     * ```ts
     * new Container({ visible: false }); // Will not be drawn and transforms will not update
     * new Container({ visible: true }); // Will be drawn and transforms will update
     * ```
     * @default true
     * @see {@link Container#renderable} For render-only control
     * @see {@link Container#alpha} For transparency
     */
    visible?: boolean;
    /**
     * The position of the container on the x axis relative to the local coordinates of the parent.
     *
     * An alias to position.x
     * @example
     * ```ts
     * new Container({ x: 100 }); // Set x position to 100
     * ```
     */
    x?: number;
    /**
     * The position of the container on the y axis relative to the local coordinates of the parent.
     *
     * An alias to position.y
     * @example
     * ```ts
     * new Container({ y: 200 }); // Set y position to 200
     * ```
     */
    y?: number;
    /**
     * An optional bounds area for this container. Setting this rectangle will stop the renderer
     * from recursively measuring the bounds of each children and instead use this single boundArea.
     *
     * > [!IMPORTANT] This is great for optimisation! If for example you have a
     * > 1000 spinning particles and you know they all sit within a specific bounds,
     * > then setting it will mean the renderer will not need to measure the
     * > 1000 children to find the bounds. Instead it will just use the bounds you set.
     * @example
     * ```ts
     * const container = new Container({
     *    boundsArea: new Rectangle(0, 0, 500, 500) // Set a fixed bounds area
     * });
     * ```
     */
    boundsArea?: Rectangle;
}

// eslint-disable-next-line requireExport/require-export-jsdoc, requireMemberAPI/require-member-api-doc
export interface Container<C extends ContainerChild>
    extends PixiMixins.Container<C>, EventEmitter<ContainerEvents<C> & AnyEvent> {}

/**
 * Container is a general-purpose display object that holds children. It also adds built-in support for advanced
 * rendering features like masking and filtering.
 *
 * It is the base class of all display objects that act as a container for other objects, including Graphics
 * and Sprite.
 *
 * <details id="transforms">
 *
 * <summary>Transforms</summary>
 *
 * The [transform]{@link Container#localTransform} of a display object describes the projection from its
 * local coordinate space to its parent's local coordinate space. The following properties are derived
 * from the transform:
 *
 * <table>
 *   <thead>
 *     <tr>
 *       <th>Property</th>
 *       <th>Description</th>
 *     </tr>
 *   </thead>
 *   <tbody>
 *     <tr>
 *       <td>[pivot]{@link Container#pivot}</td>
 *       <td>
 *         Invariant under rotation, scaling, and skewing. The projection of into the parent's space of the pivot
 *         is equal to position, regardless of the other three transformations. In other words, It is the center of
 *         rotation, scaling, and skewing.
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[position]{@link Container#position}</td>
 *       <td>
 *         Translation. This is the position of the [pivot]{@link Container#pivot} in the parent's local
 *         space. The default value of the pivot is the origin (0,0). If the top-left corner of your display object
 *         is (0,0) in its local space, then the position will be its top-left corner in the parent's local space.
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[scale]{@link Container#scale}</td>
 *       <td>
 *         Scaling. This will stretch (or compress) the display object's projection. The scale factors are along the
 *         local coordinate axes. In other words, the display object is scaled before rotated or skewed. The center
 *         of scaling is the [pivot]{@link Container#pivot}.
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[rotation]{@link Container#rotation}</td>
 *       <td>
 *          Rotation. This will rotate the display object's projection by this angle (in radians).
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[skew]{@link Container#skew}</td>
 *       <td>
 *         <p>Skewing. This can be used to deform a rectangular display object into a parallelogram.</p>
 *         <p>
 *         In PixiJS, skew has a slightly different behaviour than the conventional meaning. It can be
 *         thought of the net rotation applied to the coordinate axes (separately). For example, if "skew.x" is
 *         ⍺ and "skew.y" is β, then the line x = 0 will be rotated by ⍺ (y = -x*cot⍺) and the line y = 0 will be
 *         rotated by β (y = x*tanβ). A line y = x*tanϴ (i.e. a line at angle ϴ to the x-axis in local-space) will
 *         be rotated by an angle between ⍺ and β.
 *         </p>
 *         <p>
 *         It can be observed that if skew is applied equally to both axes, then it will be equivalent to applying
 *         a rotation. Indeed, if "skew.x" = -ϴ and "skew.y" = ϴ, it will produce an equivalent of "rotation" = ϴ.
 *         </p>
 *         <p>
 *         Another quite interesting observation is that "skew.x", "skew.y", rotation are commutative operations. Indeed,
 *         because rotation is essentially a careful combination of the two.
 *         </p>
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[angle]{@link Container#angle}</td>
 *       <td>Rotation. This is an alias for [rotation]{@link Container#rotation}, but in degrees.</td>
 *     </tr>
 *     <tr>
 *       <td>[x]{@link Container#x}</td>
 *       <td>Translation. This is an alias for position.x!</td>
 *     </tr>
 *     <tr>
 *       <td>[y]{@link Container#y}</td>
 *       <td>Translation. This is an alias for position.y!</td>
 *     </tr>
 *     <tr>
 *       <td>[width]{@link Container#width}</td>
 *       <td>
 *         Implemented in [Container]{@link Container}. Scaling. The width property calculates scale.x by dividing
 *         the "requested" width by the local bounding box width. It is indirectly an abstraction over scale.x, and there
 *         is no concept of user-defined width.
 *       </td>
 *     </tr>
 *     <tr>
 *       <td>[height]{@link Container#height}</td>
 *       <td>
 *         Implemented in [Container]{@link Container}. Scaling. The height property calculates scale.y by dividing
 *         the "requested" height by the local bounding box height. It is indirectly an abstraction over scale.y, and there
 *         is no concept of user-defined height.
 *       </td>
 *     </tr>
 *   </tbody>
 * </table>
 * </details>
 *
 * <details id="alpha">
 * <summary>Alpha</summary>
 *
 * This alpha sets a display object's **relative opacity** w.r.t its parent. For example, if the alpha of a display
 * object is 0.5 and its parent's alpha is 0.5, then it will be rendered with 25% opacity (assuming alpha is not
 * applied on any ancestor further up the chain).
 * </details>
 *
 * <details id="visible">
 * <summary>Renderable vs Visible</summary>
 *
 * The `renderable` and `visible` properties can be used to prevent a display object from being rendered to the
 * screen. However, there is a subtle difference between the two. When using `renderable`, the transforms  of the display
 * object (and its children subtree) will continue to be calculated. When using `visible`, the transforms will not
 * be calculated.
 * ```ts
 * import { BlurFilter, Container, Graphics, Sprite } from 'pixi.js';
 *
 * const container = new Container();
 * const sprite = Sprite.from('https://s3-us-west-2.amazonaws.com/s.cdpn.io/693612/IaUrttj.png');
 *
 * sprite.width = 512;
 * sprite.height = 512;
 *
 * // Adds a sprite as a child to this container. As a result, the sprite will be rendered whenever the container
 * // is rendered.
 * container.addChild(sprite);
 *
 * // Blurs whatever is rendered by the container
 * container.filters = [new BlurFilter()];
 *
 * // Only the contents within a circle at the center should be rendered onto the screen.
 * container.mask = new Graphics()
 *     .beginFill(0xffffff)
 *     .drawCircle(sprite.width / 2, sprite.height / 2, Math.min(sprite.width, sprite.height) / 2)
 *     .endFill();
 * ```
 *
 * </details>
 *
 * <details id="renderGroup">
 * <summary>RenderGroup</summary>
 *
 * In PixiJS v8, containers can be set to operate in 'render group mode',
 * transforming them into entities akin to a stage in traditional rendering paradigms.
 * A render group is a root renderable entity, similar to a container,
 * but it's rendered in a separate pass with its own unique set of rendering instructions.
 * This approach enhances rendering efficiency and organization, particularly in complex scenes.
 *
 * You can enable render group mode on any container using container.enableRenderGroup()
 * or by initializing a new container with the render group property set to true (new Container({isRenderGroup: true})).
 *  The method you choose depends on your specific use case and setup requirements.
 *
 * An important aspect of PixiJS’s rendering process is the automatic treatment of rendered scenes as render groups.
 * This conversion streamlines the rendering process, but understanding when and how this happens is crucial
 * to fully leverage its benefits.
 *
 * One of the key advantages of using render groups is the performance efficiency in moving them. Since transformations
 *  are applied at the GPU level, moving a render group, even one with complex and numerous children,
 * doesn't require recalculating the rendering instructions or performing transformations on each child.
 * This makes operations like panning a large game world incredibly efficient.
 *
 * However, it's crucial to note that render groups do not batch together.
 * This means that turning every container into a render group could actually slow things down,
 * as each render group is processed separately. It's best to use render groups judiciously, at a broader level,
 * rather than on a per-child basis.
 * This approach ensures you get the performance benefits without overburdening the rendering process.
 *
 * RenderGroups maintain their own set of rendering instructions,
 * ensuring that changes or updates within a render group don't affect the rendering
 * instructions of its parent or other render groups.
 *  This isolation ensures more stable and predictable rendering behavior.
 *
 * Additionally, renderGroups can be nested, allowing for powerful options in organizing different aspects of your scene.
 * This feature is particularly beneficial for separating complex game graphics from UI elements,
 * enabling intricate and efficient scene management in complex applications.
 *
 * This means that Containers have 3 levels of matrix to be mindful of:
 *
 * 1. localTransform, this is the transform of the container based on its own properties
 * 2. groupTransform, this it the transform of the container relative to the renderGroup it belongs too
 * 3. worldTransform, this is the transform of the container relative to the Scene being rendered
 * </details>
 * @category scene
 * @standard
 */
export class Container<C extends ContainerChild = ContainerChild> extends EventEmitter<ContainerEvents<C> & AnyEvent>
{
    /**
     * Mixes all enumerable properties and methods from a source object to Container.
     * @param source - The source of properties and methods to mix in.
     * @deprecated since 8.8.0
     */
    public static mixin(source: Dict<any>): void
    {
        // #if _DEBUG
        deprecation('8.8.0', 'Container.mixin is deprecated, please use extensions.mixin instead.');
        // #endif
        extensions.mixin(Container, source);
    }

    /**
     * unique id for this container
     * @internal
     */
    public readonly uid: number = uid('renderable');

    /** @private */
    public _updateFlags = 0b1111;

    // the render group this container owns
    /** @private */
    public renderGroup: RenderGroup = null;
    // the render group this container belongs to
    /** @private */
    public parentRenderGroup: RenderGroup = null;
    // the index of the container in the render group
    /** @private */
    public parentRenderGroupIndex: number = 0;

    // set to true if the container has changed. It is reset once the changes have been applied
    // by the transform system
    // its here to stop ensure that when things change, only one update gets registers with the transform system
    /** @private */
    public didChange = false;
    // same as above, but for the renderable
    /** @private */
    public didViewUpdate = false;

    // how deep is the container relative to its render group..
    // unless the element is the root render group - it will be relative to its parent
    /** @private */
    public relativeRenderGroupDepth = 0;

    /**
     * The array of children of this container. Each child must be a Container or extend from it.
     *
     * The array is read-only, but its contents can be modified using Container methods.
     * @example
     * ```ts
     * // Access children
     * const firstChild = container.children[0];
     * const lastChild = container.children[container.children.length - 1];
     * ```
     * @readonly
     * @see {@link Container#addChild} For adding children
     * @see {@link Container#removeChild} For removing children
     */
    public children: C[] = [];
    /**
     * The display object container that contains this display object.
     * This represents the parent-child relationship in the display tree.
     * @example
     * ```ts
     * // Basic parent access
     * const parent = sprite.parent;
     *
     * // Walk up the tree
     * let current = sprite;
     * while (current.parent) {
     *     console.log('Level up:', current.parent.constructor.name);
     *     current = current.parent;
     * }
     * ```
     * @readonly
     * @see {@link Container#addChild} For adding to a parent
     * @see {@link Container#removeChild} For removing from parent
     */
    public parent: Container = null;

    // used internally for changing up the render order.. mainly for masks and filters
    // TODO setting this should cause a rebuild??
    /** @private */
    public includeInBuild = true;
    /** @private */
    public measurable = true;
    /** @private */
    public isSimple = true;

    /**
     * The RenderLayer this container belongs to, if any.
     * If it belongs to a RenderLayer, it will be rendered from the RenderLayer's position in the scene.
     * @readonly
     * @advanced
     */
    public parentRenderLayer: IRenderLayer;

    // / /////////////Transform related props//////////////

    // used by the transform system to check if a container needs to be updated that frame
    // if the tick matches the current transform system tick, it is not updated again
    /** @internal */
    public updateTick = -1;

    /**
     * Current transform of the object based on local factors: position, scale, other stuff.
     * This matrix represents the local transformation without any parent influence.
     * @example
     * ```ts
     * // Basic transform access
     * const localMatrix = sprite.localTransform;
     * console.log(localMatrix.toString());
     * ```
     * @readonly
     * @see {@link Container#worldTransform} For global transform
     * @see {@link Container#groupTransform} For render group transform
     */
    public localTransform: Matrix = new Matrix();
    /**
     * The relative group transform is a transform relative to the render group it belongs too. It will include all parent
     * transforms and up to the render group (think of it as kind of like a stage - but the stage can be nested).
     * If this container is is self a render group matrix will be relative to its parent render group
     * @readonly
     * @advanced
     */
    public relativeGroupTransform: Matrix = new Matrix();
    /**
     * The group transform is a transform relative to the render group it belongs too.
     * If this container is render group then this will be an identity matrix. other wise it
     * will be the same as the relativeGroupTransform.
     * Use this value when actually rendering things to the screen
     * @readonly
     * @advanced
     */
    public groupTransform: Matrix = this.relativeGroupTransform;

    // the global transform taking into account the render group and all parents
    private _worldTransform: Matrix;

    /**
     * Whether this object has been destroyed. If true, the object should no longer be used.
     * After an object is destroyed, all of its functionality is disabled and references are removed.
     * @example
     * ```ts
     * // Cleanup with destroy
     * sprite.destroy();
     * console.log(sprite.destroyed); // true
     * ```
     * @default false
     * @see {@link Container#destroy} For destroying objects
     */
    public destroyed = false;

    // transform data..
    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * @internal
     */
    public _position: ObservablePoint = new ObservablePoint(this, 0, 0);

    /**
     * The scale factor of the object.
     * @internal
     */
    public _scale: ObservablePoint = defaultScale;

    /**
     * The pivot point of the container that it rotates around.
     * @internal
     */
    public _pivot: ObservablePoint = defaultPivot;

    /**
     * The skew amount, on the x and y axis.
     * @internal
     */
    public _skew: ObservablePoint = defaultSkew;

    /**
     * The X-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     * @internal
     */
    public _cx = 1;

    /**
     * The Y-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     * @internal
     */
    public _sx = 0;

    /**
     * The X-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     * @internal
     */
    public _cy = 0;

    /**
     * The Y-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     * @internal
     */
    public _sy = 1;

    /**
     * The rotation amount.
     * @internal
     */
    private _rotation = 0;

    // / COLOR related props //////////////

    // color stored as ABGR
    /** @internal */
    public localColor = 0xFFFFFF;
    /** @internal */
    public localAlpha = 1;

    /** @internal */
    public groupAlpha = 1; // A
    /** @internal */
    public groupColor = 0xFFFFFF; // BGR
    /** @internal */
    public groupColorAlpha = 0xFFFFFFFF; // ABGR

    // / BLEND related props //////////////

    /** @internal */
    public localBlendMode: BLEND_MODES = 'inherit';
    /** @internal */
    public groupBlendMode: BLEND_MODES = 'normal';

    // / VISIBILITY related props //////////////

    // visibility
    // 0b11
    // first bit is visible, second bit is renderable
    /**
     * This property holds three bits: culled, visible, renderable
     * the third bit represents culling (0 = culled, 1 = not culled) 0b100
     * the second bit represents visibility (0 = not visible, 1 = visible) 0b010
     * the first bit represents renderable (0 = not renderable, 1 = renderable) 0b001
     * @internal
     */
    public localDisplayStatus = 0b111; // 0b11 | 0b10 | 0b01 | 0b00
    /** @internal */
    public globalDisplayStatus = 0b111; // 0b11 | 0b10 | 0b01 | 0b00

    /** @internal */
    public readonly renderPipeId: string;

    /**
     * An optional bounds area for this container. Setting this rectangle will stop the renderer
     * from recursively measuring the bounds of each children and instead use this single boundArea.
     *
     * > [!IMPORTANT] This is great for optimisation! If for example you have a
     * > 1000 spinning particles and you know they all sit within a specific bounds,
     * > then setting it will mean the renderer will not need to measure the
     * > 1000 children to find the bounds. Instead it will just use the bounds you set.
     * @example
     * ```ts
     * const container = new Container();
     * container.boundsArea = new Rectangle(0, 0, 500, 500);
     * ```
     */
    public boundsArea: Rectangle;

    /**
     * A value that increments each time the containe is modified
     * eg children added, removed etc
     * @ignore
     */
    public _didContainerChangeTick = 0;
    /**
     * A value that increments each time the container view is modified
     * eg texture swap, geometry change etc
     * @ignore
     */
    public _didViewChangeTick = 0;

    /** @internal */
    public layerParentId: string;// = 'default';
    /**
     * We now use the _didContainerChangeTick and _didViewChangeTick to track changes
     * @deprecated since 8.2.6
     * @ignore
     */
    set _didChangeId(value: number)
    {
        this._didViewChangeTick = (value >> 12) & 0xFFF; // Extract the upper 12 bits
        this._didContainerChangeTick = value & 0xFFF; // Extract the lower 12 bits
    }
    /** @ignore */
    get _didChangeId(): number
    {
        return (this._didContainerChangeTick & 0xfff) | ((this._didViewChangeTick & 0xfff) << 12);
    }

    /**
     * property that tracks if the container transform has changed
     * @ignore
     */
    private _didLocalTransformChangeId = -1;

    constructor(options: ContainerOptions<C> = {})
    {
        super();

        this.effects = [];
        assignWithIgnore(this, options, {
            children: true,
            parent: true,
            effects: true,
        });

        options.children?.forEach((child) => this.addChild(child));
        options.parent?.addChild(this);
    }

    /**
     * Adds one or more children to the container.
     * The children will be rendered as part of this container's display list.
     * @example
     * ```ts
     * // Add a single child
     * container.addChild(sprite);
     *
     * // Add multiple children
     * container.addChild(background, player, foreground);
     *
     * // Add with type checking
     * const sprite = container.addChild<Sprite>(new Sprite(texture));
     * sprite.tint = 'red';
     * ```
     * @param children - The Container(s) to add to the container
     * @returns The first child that was added
     * @see {@link Container#removeChild} For removing children
     * @see {@link Container#addChildAt} For adding at specific index
     */
    public addChild<U extends(C | IRenderLayer)[]>(...children: U): U[0]
    {
        // #if _DEBUG
        if (!this.allowChildren)
        {
            deprecation(v8_0_0, 'addChild: Only Containers will be allowed to add children in v8.0.0');
        }
        // #endif

        if (children.length > 1)
        {
            // loop through the array and add all children
            for (let i = 0; i < children.length; i++)
            {
                this.addChild(children[i]);
            }

            return children[0];
        }

        const child = children[0] as C;

        const renderGroup = this.renderGroup || this.parentRenderGroup;

        if (child.parent === this)
        {
            this.children.splice(this.children.indexOf(child), 1);
            this.children.push(child);

            if (renderGroup)
            {
                renderGroup.structureDidChange = true;
            }

            return child;
        }

        if (child.parent)
        {
            // TODO Optimisation...if the parent has the same render group, this does not need to change!
            child.parent.removeChild(child);
        }

        this.children.push(child);

        if (this.sortableChildren) this.sortDirty = true;

        child.parent = this;

        child.didChange = true;

        // TODO - OPtimise this? could check what the parent has set?
        child._updateFlags = 0b1111;

        if (renderGroup)
        {
            renderGroup.addChild(child);
        }

        this.emit('childAdded', child, this, this.children.length - 1);
        child.emit('added', this);

        this._didViewChangeTick++;

        if (child._zIndex !== 0)
        {
            child.depthOfChildModified();
        }

        return child;
    }

    /**
     * Removes one or more children from the container.
     * When removing multiple children, events will be triggered for each child in sequence.
     * @example
     * ```ts
     * // Remove a single child
     * const removed = container.removeChild(sprite);
     *
     * // Remove multiple children
     * const bg = container.removeChild(background, player, userInterface);
     *
     * // Remove with type checking
     * const sprite = container.removeChild<Sprite>(childSprite);
     * sprite.texture = newTexture;
     * ```
     * @param children - The Container(s) to remove
     * @returns The first child that was removed
     * @see {@link Container#addChild} For adding children
     * @see {@link Container#removeChildren} For removing multiple children
     */
    public removeChild<U extends(C | IRenderLayer)[]>(...children: U): U[0]
    {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1)
        {
            // loop through the arguments property and remove all children
            for (let i = 0; i < children.length; i++)
            {
                this.removeChild(children[i]);
            }

            return children[0];
        }

        const child = children[0] as C;

        const index = this.children.indexOf(child);

        if (index > -1)
        {
            this._didViewChangeTick++;

            this.children.splice(index, 1);

            if (this.renderGroup)
            {
                this.renderGroup.removeChild(child);
            }
            else if (this.parentRenderGroup)
            {
                this.parentRenderGroup.removeChild(child);
            }

            if (child.parentRenderLayer)
            {
                child.parentRenderLayer.detach(child);
            }

            child.parent = null;
            this.emit('childRemoved', child, this, index);
            child.emit('removed', this);
        }

        return child;
    }

    /** @ignore */
    public _onUpdate(point?: ObservablePoint)
    {
        if (point)
        {
            //   this.updateFlags |= UPDATE_TRANSFORM;

            if (point === this._skew)
            {
                this._updateSkew();
            }
        }

        this._didContainerChangeTick++;

        if (this.didChange) return;
        this.didChange = true;

        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.onChildUpdate(this);
        }
    }

    set isRenderGroup(value: boolean)
    {
        if (!!this.renderGroup === value) return;

        if (value)
        {
            this.enableRenderGroup();
        }
        else
        {
            this.disableRenderGroup();
        }
    }

    /**
     * Returns true if this container is a render group.
     * This means that it will be rendered as a separate pass, with its own set of instructions
     * @advanced
     */
    get isRenderGroup(): boolean
    {
        return !!this.renderGroup;
    }

    /**
     * Calling this enables a render group for this container.
     * This means it will be rendered as a separate set of instructions.
     * The transform of the container will also be handled on the GPU rather than the CPU.
     * @advanced
     */
    public enableRenderGroup(): void
    {
        if (this.renderGroup) return;

        const parentRenderGroup = this.parentRenderGroup;

        parentRenderGroup?.removeChild(this);

        this.renderGroup = BigPool.get(RenderGroup, this);

        // this group matrix will now be an identity matrix,
        // as its own transform will be passed to the GPU
        this.groupTransform = Matrix.IDENTITY;

        parentRenderGroup?.addChild(this);

        this._updateIsSimple();
    }

    /**
     * This will disable the render group for this container.
     * @advanced
     */
    public disableRenderGroup(): void
    {
        if (!this.renderGroup) return;

        const parentRenderGroup = this.parentRenderGroup;

        parentRenderGroup?.removeChild(this);

        BigPool.return(this.renderGroup);

        this.renderGroup = null;
        this.groupTransform = this.relativeGroupTransform;

        parentRenderGroup?.addChild(this);

        this._updateIsSimple();
    }

    /** @ignore */
    public _updateIsSimple()
    {
        this.isSimple = !(this.renderGroup) && (this.effects.length === 0);
    }

    /**
     * Current transform of the object based on world (parent) factors.
     *
     * This matrix represents the absolute transformation in the scene graph.
     * @example
     * ```ts
     * // Get world position
     * const worldPos = container.worldTransform;
     * console.log(`World position: (${worldPos.tx}, ${worldPos.ty})`);
     * ```
     * @readonly
     * @see {@link Container#localTransform} For local space transform
     */
    get worldTransform()
    {
        this._worldTransform ||= new Matrix();

        if (this.renderGroup)
        {
            this._worldTransform.copyFrom(this.renderGroup.worldTransform);
        }
        else if (this.parentRenderGroup)
        {
            this._worldTransform.appendFrom(this.relativeGroupTransform, this.parentRenderGroup.worldTransform);
        }

        return this._worldTransform;
    }

    /**
     * The position of the container on the x axis relative to the local coordinates of the parent.
     *
     * An alias to position.x
     * @example
     * ```ts
     * // Basic position
     * container.x = 100;
     * ```
     */
    get x(): number
    {
        return this._position.x;
    }

    set x(value: number)
    {
        this._position.x = value;
    }

    /**
     * The position of the container on the y axis relative to the local coordinates of the parent.
     *
     * An alias to position.y
     * @example
     * ```ts
     * // Basic position
     * container.y = 200;
     * ```
     */
    get y(): number
    {
        return this._position.y;
    }

    set y(value: number)
    {
        this._position.y = value;
    }

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     * @example
     * ```ts
     * // Basic position setting
     * container.position.set(100, 200);
     * container.position.set(100); // Sets both x and y to 100
     * // Using point data
     * container.position = { x: 50, y: 75 };
     * ```
     * @since 4.0.0
     */
    get position(): ObservablePoint
    {
        return this._position;
    }

    set position(value: PointData)
    {
        this._position.copyFrom(value);
    }

    /**
     * The rotation of the object in radians.
     *
     * > [!NOTE] 'rotation' and 'angle' have the same effect on a display object;
     * > rotation is in radians, angle is in degrees.
     * @example
     * ```ts
     * // Basic rotation
     * container.rotation = Math.PI / 4; // 45 degrees
     *
     * // Convert from degrees
     * const degrees = 45;
     * container.rotation = degrees * Math.PI / 180;
     *
     * // Rotate around center
     * container.pivot.set(container.width / 2, container.height / 2);
     * container.rotation = Math.PI; // 180 degrees
     * ```
     */
    get rotation(): number
    {
        return this._rotation;
    }

    set rotation(value: number)
    {
        if (this._rotation !== value)
        {
            this._rotation = value;
            this._onUpdate(this._skew);
        }
    }

    /**
     * The angle of the object in degrees.
     *
     * > [!NOTE] 'rotation' and 'angle' have the same effect on a display object;
     * > rotation is in radians, angle is in degrees.
     @example
     * ```ts
     * // Basic angle rotation
     * sprite.angle = 45; // 45 degrees
     *
     * // Rotate around center
     * sprite.pivot.set(sprite.width / 2, sprite.height / 2);
     * sprite.angle = 180; // Half rotation
     *
     * // Reset rotation
     * sprite.angle = 0;
     * ```
     */
    get angle(): number
    {
        return this.rotation * RAD_TO_DEG;
    }

    set angle(value: number)
    {
        this.rotation = value * DEG_TO_RAD;
    }

    /**
     * The center of rotation, scaling, and skewing for this display object in its local space.
     * The `position` is the projection of `pivot` in the parent's local space.
     *
     * By default, the pivot is the origin (0, 0).
     * @example
     * ```ts
     * // Rotate around center
     * container.pivot.set(container.width / 2, container.height / 2);
     * container.rotation = Math.PI; // Rotates around center
     * ```
     * @since 4.0.0
     */
    get pivot(): ObservablePoint
    {
        if (this._pivot === defaultPivot)
        {
            this._pivot = new ObservablePoint(this, 0, 0);
        }

        return this._pivot;
    }

    set pivot(value: PointData | number)
    {
        if (this._pivot === defaultPivot)
        {
            this._pivot = new ObservablePoint(this, 0, 0);
        }

        typeof value === 'number' ? this._pivot.set(value) : this._pivot.copyFrom(value);
    }

    /**
     * The skew factor for the object in radians. Skewing is a transformation that distorts
     * the object by rotating it differently at each point, creating a non-uniform shape.
     * @example
     * ```ts
     * // Basic skewing
     * container.skew.set(0.5, 0); // Skew horizontally
     * container.skew.set(0, 0.5); // Skew vertically
     *
     * // Skew with point data
     * container.skew = { x: 0.3, y: 0.3 }; // Diagonal skew
     *
     * // Reset skew
     * container.skew.set(0, 0);
     *
     * // Animate skew
     * app.ticker.add(() => {
     *     // Create wave effect
     *     container.skew.x = Math.sin(Date.now() / 1000) * 0.3;
     * });
     *
     * // Combine with rotation
     * container.rotation = Math.PI / 4; // 45 degrees
     * container.skew.set(0.2, 0.2); // Skew the rotated object
     * ```
     * @since 4.0.0
     * @type {ObservablePoint} Point-like object with x/y properties in radians
     * @default {x: 0, y: 0}
     */
    get skew(): ObservablePoint
    {
        if (this._skew === defaultSkew)
        {
            this._skew = new ObservablePoint(this, 0, 0);
        }

        return this._skew;
    }

    set skew(value: PointData)
    {
        if (this._skew === defaultSkew)
        {
            this._skew = new ObservablePoint(this, 0, 0);
        }

        this._skew.copyFrom(value);
    }

    /**
     * The scale factors of this object along the local coordinate axes.
     *
     * The default scale is (1, 1).
     * @example
     * ```ts
     * // Basic scaling
     * container.scale.set(2, 2); // Scales to double size
     * container.scale.set(2); // Scales uniformly to double size
     * container.scale = 2; // Scales uniformly to double size
     * // Scale to a specific width and height
     * container.setSize(200, 100); // Sets width to 200 and height to 100
     * ```
     * @since 4.0.0
     */
    get scale(): ObservablePoint
    {
        if (this._scale === defaultScale)
        {
            this._scale = new ObservablePoint(this, 1, 1);
        }

        return this._scale;
    }

    set scale(value: PointData | number)
    {
        if (this._scale === defaultScale)
        {
            this._scale = new ObservablePoint(this, 0, 0);
        }

        typeof value === 'number' ? this._scale.set(value) : this._scale.copyFrom(value);
    }

    /**
     * The width of the Container, setting this will actually modify the scale to achieve the value set.
     * > [!NOTE] Changing the width will adjust the scale.x property of the container while maintaining its aspect ratio.
     * > [!NOTE] If you want to set both width and height at the same time, use {@link Container#setSize}
     * as it is more optimized by not recalculating the local bounds twice.
     *  @example
     * ```ts
     * // Basic width setting
     * container.width = 100;
     * // Optimized width setting
     * container.setSize(100, 100);
     * ```
     */
    get width(): number
    {
        return Math.abs(this.scale.x * this.getLocalBounds().width);
    }

    set width(value: number)
    {
        const localWidth = this.getLocalBounds().width;

        this._setWidth(value, localWidth);
    }

    /**
     * The height of the Container,
     * > [!NOTE] Changing the height will adjust the scale.y property of the container while maintaining its aspect ratio.
     * > [!NOTE] If you want to set both width and height at the same time, use {@link Container#setSize}
     * as it is more optimized by not recalculating the local bounds twice.
     * @example
     * ```ts
     * // Basic height setting
     * container.height = 200;
     * // Optimized height setting
     * container.setSize(100, 200);
     * ```
     */
    get height(): number
    {
        return Math.abs(this.scale.y * this.getLocalBounds().height);
    }

    set height(value: number)
    {
        const localHeight = this.getLocalBounds().height;

        this._setHeight(value, localHeight);
    }

    /**
     * Retrieves the size of the container as a [Size]{@link Size} object.
     *
     * This is faster than get the width and height separately.
     * @example
     * ```ts
     * // Basic size retrieval
     * const size = container.getSize();
     * console.log(`Size: ${size.width}x${size.height}`);
     *
     * // Reuse existing size object
     * const reuseSize = { width: 0, height: 0 };
     * container.getSize(reuseSize);
     * ```
     * @param out - Optional object to store the size in.
     * @returns - The size of the container.
     */
    public getSize(out?: Size): Size
    {
        if (!out)
        {
            out = {} as Size;
        }

        const bounds = this.getLocalBounds();

        out.width = Math.abs(this.scale.x * bounds.width);
        out.height = Math.abs(this.scale.y * bounds.height);

        return out;
    }

    /**
     * Sets the size of the container to the specified width and height.
     * This is more efficient than setting width and height separately as it only recalculates bounds once.
     * @example
     * ```ts
     * // Basic size setting
     * container.setSize(100, 200);
     *
     * // Set uniform size
     * container.setSize(100); // Sets both width and height to 100
     * ```
     * @param value - This can be either a number or a [Size]{@link Size} object.
     * @param height - The height to set. Defaults to the value of `width` if not provided.
     */
    public setSize(value: number | Optional<Size, 'height'>, height?: number)
    {
        const size = this.getLocalBounds();

        if (typeof value === 'object')
        {
            height = value.height ?? value.width;
            value = value.width;
        }
        else
        {
            height ??= value;
        }

        value !== undefined && this._setWidth(value, size.width);
        height !== undefined && this._setHeight(height, size.height);
    }

    /** Called when the skew or the rotation changes. */
    private _updateSkew(): void
    {
        const rotation = this._rotation;
        const skew = this._skew;

        this._cx = Math.cos(rotation + skew._y);
        this._sx = Math.sin(rotation + skew._y);
        this._cy = -Math.sin(rotation - skew._x); // cos, added PI/2
        this._sy = Math.cos(rotation - skew._x); // sin, added PI/2
    }

    /**
     * Updates the transform properties of the container.
     * Allows partial updates of transform properties for optimized manipulation.
     * @example
     * ```ts
     * // Basic transform update
     * container.updateTransform({
     *     x: 100,
     *     y: 200,
     *     rotation: Math.PI / 4
     * });
     *
     * // Scale and rotate around center
     * sprite.updateTransform({
     *     pivotX: sprite.width / 2,
     *     pivotY: sprite.height / 2,
     *     scaleX: 2,
     *     scaleY: 2,
     *     rotation: Math.PI
     * });
     *
     * // Update position only
     * button.updateTransform({
     *     x: button.x + 10, // Move right
     *     y: button.y      // Keep same y
     * });
     * ```
     * @param opts - Transform options to update
     * @param opts.x - The x position
     * @param opts.y - The y position
     * @param opts.scaleX - The x-axis scale factor
     * @param opts.scaleY - The y-axis scale factor
     * @param opts.rotation - The rotation in radians
     * @param opts.skewX - The x-axis skew factor
     * @param opts.skewY - The y-axis skew factor
     * @param opts.pivotX - The x-axis pivot point
     * @param opts.pivotY - The y-axis pivot point
     * @returns This container, for chaining
     * @see {@link Container#setFromMatrix} For matrix-based transforms
     * @see {@link Container#position} For direct position access
     */
    public updateTransform(opts: Partial<UpdateTransformOptions>): this
    {
        this.position.set(
            typeof opts.x === 'number' ? opts.x : this.position.x,
            typeof opts.y === 'number' ? opts.y : this.position.y
        );
        this.scale.set(
            typeof opts.scaleX === 'number' ? opts.scaleX || 1 : this.scale.x,
            typeof opts.scaleY === 'number' ? opts.scaleY || 1 : this.scale.y
        );
        this.rotation = typeof opts.rotation === 'number' ? opts.rotation : this.rotation;
        this.skew.set(
            typeof opts.skewX === 'number' ? opts.skewX : this.skew.x,
            typeof opts.skewY === 'number' ? opts.skewY : this.skew.y
        );
        this.pivot.set(
            typeof opts.pivotX === 'number' ? opts.pivotX : this.pivot.x,
            typeof opts.pivotY === 'number' ? opts.pivotY : this.pivot.y
        );

        return this;
    }

    /**
     * Updates the local transform properties by decomposing the given matrix.
     * Extracts position, scale, rotation, and skew from a transformation matrix.
     * @example
     * ```ts
     * // Basic matrix transform
     * const matrix = new Matrix()
     *     .translate(100, 100)
     *     .rotate(Math.PI / 4)
     *     .scale(2, 2);
     *
     * container.setFromMatrix(matrix);
     *
     * // Copy transform from another container
     * const source = new Container();
     * source.position.set(100, 100);
     * source.rotation = Math.PI / 2;
     *
     * target.setFromMatrix(source.localTransform);
     *
     * // Reset transform
     * container.setFromMatrix(Matrix.IDENTITY);
     * ```
     * @param matrix - The matrix to use for updating the transform
     * @see {@link Container#updateTransform} For property-based updates
     * @see {@link Matrix#decompose} For matrix decomposition details
     */
    public setFromMatrix(matrix: Matrix): void
    {
        matrix.decompose(this);
    }

    /** Updates the local transform. */
    public updateLocalTransform(): void
    {
        const localTransformChangeId = this._didContainerChangeTick;

        if (this._didLocalTransformChangeId === localTransformChangeId) return;

        this._didLocalTransformChangeId = localTransformChangeId;
        //   this.didChange = false;

        const lt = this.localTransform;
        const scale = this._scale;
        const pivot = this._pivot;
        const position = this._position;

        const sx = scale._x;
        const sy = scale._y;

        const px = pivot._x;
        const py = pivot._y;

        // get the matrix values of the container based on its this properties..
        lt.a = this._cx * sx;
        lt.b = this._sx * sx;
        lt.c = this._cy * sy;
        lt.d = this._sy * sy;

        lt.tx = position._x - ((px * lt.a) + (py * lt.c));
        lt.ty = position._y - ((px * lt.b) + (py * lt.d));
    }

    // / ///// color related stuff

    set alpha(value: number)
    {
        if (value === this.localAlpha) return;

        this.localAlpha = value;

        this._updateFlags |= UPDATE_COLOR;

        this._onUpdate();
    }

    /**
     * The opacity of the object relative to its parent's opacity.
     * Value ranges from 0 (fully transparent) to 1 (fully opaque).
     * @example
     * ```ts
     * // Basic transparency
     * sprite.alpha = 0.5; // 50% opacity
     *
     * // Inherited opacity
     * container.alpha = 0.5;
     * const child = new Sprite(texture);
     * child.alpha = 0.5;
     * container.addChild(child);
     * // child's effective opacity is 0.25 (0.5 * 0.5)
     * ```
     * @default 1
     * @see {@link Container#visible} For toggling visibility
     * @see {@link Container#renderable} For render control
     */
    get alpha(): number
    {
        return this.localAlpha;
    }

    set tint(value: ColorSource)
    {
        const tempColor = Color.shared.setValue(value ?? 0xFFFFFF);
        const bgr = tempColor.toBgrNumber();

        if (bgr === this.localColor) return;

        this.localColor = bgr;

        this._updateFlags |= UPDATE_COLOR;

        this._onUpdate();
    }

    /**
     * The tint applied to the sprite.
     *
     * This can be any valid {@link ColorSource}.
     * @example
     * ```ts
     * // Basic color tinting
     * container.tint = 0xff0000; // Red tint
     * container.tint = 'red';    // Same as above
     * container.tint = '#00ff00'; // Green
     * container.tint = 'rgb(0,0,255)'; // Blue
     *
     * // Remove tint
     * container.tint = 0xffffff; // White = no tint
     * container.tint = null;     // Also removes tint
     * ```
     * @default 0xFFFFFF
     * @see {@link Container#alpha} For transparency
     * @see {@link Container#visible} For visibility control
     */
    get tint(): number
    {
        // convert bgr to rgb..
        return bgr2rgb(this.localColor);
    }

    // / //////////////// blend related stuff

    set blendMode(value: BLEND_MODES)
    {
        if (this.localBlendMode === value) return;
        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.structureDidChange = true;
        }

        this._updateFlags |= UPDATE_BLEND;

        this.localBlendMode = value;

        this._onUpdate();
    }

    /**
     * The blend mode to be applied to the sprite. Controls how pixels are blended when rendering.
     *
     * Setting to 'normal' will reset to default blending.
     * > [!NOTE] More blend modes are available after importing the `pixi.js/advanced-blend-modes` sub-export.
     * @example
     * ```ts
     * // Basic blend modes
     * sprite.blendMode = 'add';        // Additive blending
     * sprite.blendMode = 'multiply';   // Multiply colors
     * sprite.blendMode = 'screen';     // Screen blend
     *
     * // Reset blend mode
     * sprite.blendMode = 'normal';     // Normal blending
     * ```
     * @default 'normal'
     * @see {@link Container#alpha} For transparency
     * @see {@link Container#tint} For color adjustments
     */
    get blendMode(): BLEND_MODES
    {
        return this.localBlendMode;
    }

    // / ///////// VISIBILITY / RENDERABLE /////////////////

    /**
     * The visibility of the object. If false the object will not be drawn,
     * and the transform will not be updated.
     * @example
     * ```ts
     * // Basic visibility toggle
     * sprite.visible = false; // Hide sprite
     * sprite.visible = true;  // Show sprite
     * ```
     * @default true
     * @see {@link Container#renderable} For render-only control
     * @see {@link Container#alpha} For transparency
     */
    get visible()
    {
        return !!(this.localDisplayStatus & 0b010);
    }

    set visible(value: boolean)
    {
        const valueNumber = value ? 0b010 : 0;

        if ((this.localDisplayStatus & 0b010) === valueNumber) return;

        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.structureDidChange = true;
        }

        this._updateFlags |= UPDATE_VISIBLE;

        this.localDisplayStatus ^= 0b010;

        this._onUpdate();
    }

    /** @ignore */
    get culled()
    {
        return !(this.localDisplayStatus & 0b100);
    }

    /** @ignore */
    set culled(value: boolean)
    {
        const valueNumber = value ? 0 : 0b100;

        if ((this.localDisplayStatus & 0b100) === valueNumber) return;

        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.structureDidChange = true;
        }

        this._updateFlags |= UPDATE_VISIBLE;
        this.localDisplayStatus ^= 0b100;

        this._onUpdate();
    }

    /**
     * Controls whether this object can be rendered. If false the object will not be drawn,
     * but the transform will still be updated. This is different from visible, which skips
     * transform updates.
     * @example
     * ```ts
     * // Basic render control
     * sprite.renderable = false; // Skip rendering
     * sprite.renderable = true;  // Enable rendering
     * ```
     * @default true
     * @see {@link Container#visible} For skipping transform updates
     * @see {@link Container#alpha} For transparency
     */
    get renderable()
    {
        return !!(this.localDisplayStatus & 0b001);
    }

    set renderable(value: boolean)
    {
        const valueNumber = value ? 0b001 : 0;

        if ((this.localDisplayStatus & 0b001) === valueNumber) return;

        this._updateFlags |= UPDATE_VISIBLE;
        this.localDisplayStatus ^= 0b001;

        if (this.parentRenderGroup)
        {
            this.parentRenderGroup.structureDidChange = true;
        }

        this._onUpdate();
    }

    /**
     * Whether or not the object should be rendered.
     * @advanced
     */
    get isRenderable(): boolean
    {
        return (this.localDisplayStatus === 0b111 && this.groupAlpha > 0);
    }

    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @example
     * ```ts
     * container.destroy();
     * container.destroy(true);
     * container.destroy({ children: true });
     * container.destroy({ children: true, texture: true, textureSource: true });
     * ```
     */
    public destroy(options: DestroyOptions = false): void
    {
        if (this.destroyed) return;
        this.destroyed = true;

        // remove children is faster than removeChild..

        let oldChildren: ContainerChild[];

        // we add this check as calling removeChildren on particle container will throw an error
        // As we know it does cannot have any children, check before calling the function.
        if (this.children.length)
        {
            oldChildren = this.removeChildren(0, this.children.length);
        }

        this.removeFromParent();
        this.parent = null;
        this._maskEffect = null;
        this._filterEffect = null;
        this.effects = null;
        this._position = null;
        this._scale = null;
        this._pivot = null;
        this._skew = null;

        this.emit('destroyed', this);

        this.removeAllListeners();

        const destroyChildren = typeof options === 'boolean' ? options : options?.children;

        if (destroyChildren && oldChildren)
        {
            for (let i = 0; i < oldChildren.length; ++i)
            {
                oldChildren[i].destroy(options);
            }
        }

        this.renderGroup?.destroy();
        this.renderGroup = null;
    }
}

extensions.mixin(
    Container,
    childrenHelperMixin,
    getFastGlobalBoundsMixin,
    toLocalGlobalMixin,
    onRenderMixin,
    measureMixin,
    effectsMixin,
    findMixin,
    sortMixin,
    cullingMixin,
    cacheAsTextureMixin,
    getGlobalMixin,
    collectRenderablesMixin,
);
