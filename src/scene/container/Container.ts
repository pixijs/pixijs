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
 */
export type ContainerChild = Container;

/**
 * @module
 * @categoryDescription scene
 * This is where you'll find all the display objects available in Pixi.
 *
 * All display objects inherit from the {@link Container} class. You can use a `Container` for simple grouping of
 * other display objects. Here's all the available display object classes.
 *
 * - {@link Container} is the base class for all display objects that act as a container for other objects.
 *   - {@link Sprite} is a display object that uses a texture
 *      - {@link AnimatedSprite} is a sprite that can play animations
 *   - {@link TilingSprite} a fast way of rendering a tiling image
 *   - {@link NineSliceSprite} allows you to stretch a texture using 9-slice scaling
 *   - {@link Graphics} is a graphic object that can be drawn to the screen.
 *   - {@link Mesh} empowers you to have maximum flexibility to render any kind of visuals you can think of
 *      - {@link MeshSimple} mimics Mesh, providing easy-to-use constructor arguments
 *      - {@link MeshPlane} allows you to draw a texture across several points and then manipulate these points
 *      - {@link MeshRope} allows you to draw a texture across several points and then manipulate these points
 *   - {@link Text} render text using custom fonts
 *      - {@link BitmapText} render text using a bitmap font
 *      - {@link HTMLText} render text using HTML and CSS
 */

// as pivot and skew are the least used properties of a container, we can use this optimisation
// to avoid allocating lots of unnecessary objects for them.
const defaultSkew = new ObservablePoint(null);
const defaultPivot = new ObservablePoint(null);
const defaultScale = new ObservablePoint(null, 1, 1);

/**
 * The events that can be emitted by a Container.
 * @category scene
 */
export interface ContainerEvents<C extends ContainerChild> extends PixiMixins.ContainerEvents
{
    /**
     * Emitted when this container is added to a new container.
     * @param container - The parent container.
     */
    added: [container: Container];
    /**
     * Emitted when a child is added to the container.
     * @param child - The child that was added.
     * @param container - The container that the child was added to.
     * @param index - The index at which the child was added.
     */
    childAdded: [child: C, container: Container, index: number];
    /**
     * Emitted when this container is removed from the parent.
     * @param container - The parent container.
     */
    removed: [container: Container];
    /**
     * Emitted when a child is removed from the container.
     * @param child - The child that was removed.
     * @param container - The container that the child was removed from.
     * @param index - The index at which the child was removed.
     */
    childRemoved: [child: C, container: Container, index: number];
    /**
     * Emitted when the container is destroyed.
     * @param container - The container that was destroyed.
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
 * @see Container
 */
export interface ContainerOptions<C extends ContainerChild = ContainerChild> extends PixiMixins.ContainerOptions
{
    /** @see Container#isRenderGroup */
    isRenderGroup?: boolean;

    /** @see Container#blendMode */
    blendMode?: BLEND_MODES;
    /** @see Container#tint */
    tint?: ColorSource;

    /** @see Container#alpha */
    alpha?: number;
    /** @see Container#angle */
    angle?: number;
    /** @see Container#children */
    children?: C[];
    /** @see Container#parent */
    parent?: Container;
    /** @see Container#renderable */
    renderable?: boolean;
    /** @see Container#rotation */
    rotation?: number;
    /** @see Container#scale */
    scale?: PointData | number;
    /** @see Container#pivot */
    pivot?: PointData | number;
    /** @see Container#position */
    position?: PointData;
    /** @see Container#skew */
    skew?: PointData;
    /** @see Container#visible */
    visible?: boolean;
    /** @see Container#x */
    x?: number;
    /** @see Container#y */
    y?: number;
    /** @see Container#boundArea */
    boundsArea?: Rectangle;
}

// eslint-disable-next-line requireExport/require-export-jsdoc
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

    /** unique id for this container */
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
     * The array of children of this container.
     * @readonly
     */
    public children: C[] = [];
    /** The display object container that contains this display object. */
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
     */
    public parentRenderLayer: IRenderLayer;

    // / /////////////Transform related props//////////////

    // used by the transform system to check if a container needs to be updated that frame
    // if the tick matches the current transform system tick, it is not updated again
    /** @internal */
    public updateTick = -1;

    /**
     * Current transform of the object based on local factors: position, scale, other stuff.
     * @readonly
     */
    public localTransform: Matrix = new Matrix();
    /**
     * The relative group transform is a transform relative to the render group it belongs too. It will include all parent
     * transforms and up to the render group (think of it as kind of like a stage - but the stage can be nested).
     * If this container is is self a render group matrix will be relative to its parent render group
     * @readonly
     */
    public relativeGroupTransform: Matrix = new Matrix();
    /**
     * The group transform is a transform relative to the render group it belongs too.
     * If this container is render group then this will be an identity matrix. other wise it
     * will be the same as the relativeGroupTransform.
     * Use this value when actually rendering things to the screen
     * @readonly
     */
    public groupTransform: Matrix = this.relativeGroupTransform;

    // the global transform taking into account the render group and all parents
    private _worldTransform: Matrix;

    /** If the object has been destroyed via destroy(). If true, it should not be used. */
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
    public localColor = 0xFFFFFF;
    public localAlpha = 1;

    public groupAlpha = 1; // A
    public groupColor = 0xFFFFFF; // BGR
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

    public readonly renderPipeId: string;

    /**
     * An optional bounds area for this container. Setting this rectangle will stop the renderer
     * from recursively measuring the bounds of each children and instead use this single boundArea.
     * This is great for optimisation! If for example you have a 1000 spinning particles and you know they all sit
     * within a specific bounds, then setting it will mean the renderer will not need to measure the
     * 1000 children to find the bounds. Instead it will just use the bounds you set.
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
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     * @param {...Container} children - The Container(s) to add to the container
     * @returns {Container} - The first child that was added.
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
     * @param {...Container} children - The Container(s) to remove
     * @returns {Container} The first child that was removed.
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
     */
    get isRenderGroup(): boolean
    {
        return !!this.renderGroup;
    }

    /**
     * Calling this enables a render group for this container.
     * This means it will be rendered as a separate set of instructions.
     * The transform of the container will also be handled on the GPU rather than the CPU.
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

    /** This will disable the render group for this container. */
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
     * @readonly
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
     * An alias to position.x
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
     * An alias to position.y
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
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
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
     * 'rotation' and 'angle' have the same effect on a display object; rotation is in radians, angle is in degrees.
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
     * The center of rotation, scaling, and skewing for this display object in its local space. The `position`
     * is the projection of `pivot` in the parent's local space.
     *
     * By default, the pivot is the origin (0, 0).
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
     * The skew factor for the object in radians.
     * @since 4.0.0
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

    /** The width of the Container, setting this will actually modify the scale to achieve the value set. */
    get width(): number
    {
        return Math.abs(this.scale.x * this.getLocalBounds().width);
    }

    set width(value: number)
    {
        const localWidth = this.getLocalBounds().width;

        this._setWidth(value, localWidth);
    }

    /** The height of the Container, setting this will actually modify the scale to achieve the value set. */
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
     * This is faster than get the width and height separately.
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
     * This is faster than setting the width and height separately.
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
     * Updates the transform properties of the container (accepts partial values).
     * @param {object} opts - The options for updating the transform.
     * @param {number} opts.x - The x position of the container.
     * @param {number} opts.y - The y position of the container.
     * @param {number} opts.scaleX - The scale factor on the x-axis.
     * @param {number} opts.scaleY - The scale factor on the y-axis.
     * @param {number} opts.rotation - The rotation of the container, in radians.
     * @param {number} opts.skewX - The skew factor on the x-axis.
     * @param {number} opts.skewY - The skew factor on the y-axis.
     * @param {number} opts.pivotX - The x coordinate of the pivot point.
     * @param {number} opts.pivotY - The y coordinate of the pivot point.
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
     * Updates the local transform using the given matrix.
     * @param matrix - The matrix to use for updating the transform.
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

    /** The opacity of the object. */
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
     * The tint applied to the sprite. This is a hex value.
     *
     * A value of 0xFFFFFF will remove any tint effect.
     * @default 0xFFFFFF
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
     * The blend mode to be applied to the sprite. Apply a value of `'normal'` to reset the blend mode.
     * @default 'normal'
     */
    get blendMode(): BLEND_MODES
    {
        return this.localBlendMode;
    }

    // / ///////// VISIBILITY / RENDERABLE /////////////////

    /** The visibility of the object. If false the object will not be drawn, and the transform will not be updated. */
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

    /** Can this object be rendered, if false the object will not be drawn but the transform will still be updated. */
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

    /** Whether or not the object should be rendered. */
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
     * container.destroy();
     * container.destroy(true);
     * container.destroy({ children: true });
     * container.destroy({ children: true, texture: true, textureSource: true });
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
