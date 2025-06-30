import { type InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import { type Renderer } from '../../rendering/renderers/types';
import { warn } from '../../utils/logging/warn';
import { type Bounds } from '../container/bounds/Bounds';
import { Container } from '../container/Container';

import type EventEmitter from 'eventemitter3';
// TODO make it clear render layer cannot have 'filters'

/**
 * Options for configuring a RenderLayer. A RenderLayer allows control over rendering order
 * independent of the scene graph hierarchy.
 * @example
 * ```ts
 * // Basic layer with automatic sorting
 * const layer = new RenderLayer({
 *     sortableChildren: true
 * });
 *
 * // Layer with custom sort function
 * const customLayer = new RenderLayer({
 *     sortableChildren: true,
 *     sortFunction: (a, b) => {
 *         // Sort by y position
 *         return a.position.y - b.position.y;
 *     }
 * });
 *
 * // Add objects to layer while maintaining scene graph parent
 * const sprite = new Sprite(texture);
 * container.addChild(sprite);      // Add to scene graph
 * layer.attach(sprite);            // Add to render layer
 *
 * // Manual sorting when needed
 * const manualLayer = new RenderLayer({
 *     sortableChildren: false
 * });
 * manualLayer.attach(sprite1, sprite2);
 * manualLayer.sortRenderLayerChildren(); // Sort manually
 * ```
 * @category scene
 * @standard
 */
export interface RenderLayerOptions
{
    /**
     * If true, the layer's children will be sorted by zIndex before rendering.
     * If false, you can manually sort the children using sortRenderLayerChildren when needed.
     * @default false
     * @example
     * ```ts
     * const layer = new RenderLayer({
     *     sortableChildren: true // Automatically sorts children by zIndex
     * });
     * ```
     * @see {@link RenderLayer#sortRenderLayerChildren} For manual sorting
     * @see {@link RenderLayer#sortFunction} For customizing the sort logic
     * @see {@link Container#zIndex} For the default sort property
     */
    sortableChildren?: boolean;

    /**
     * Custom sort function to sort layer children. Default sorts by zIndex.
     * @param a - First container to compare
     * @param b - Second container to compare
     * @returns Negative if a should render before b, positive if b should render before a
     * @example
     * ```ts
     * const layer = new RenderLayer({
     *     sortFunction: (a, b) => {
     *         // Sort by y position
     *         return a.position.y - b.position.y;
     *     }
     * });
     * ```
     * @see {@link RenderLayer#sortableChildren} For enabling automatic sorting
     * @see {@link RenderLayer#sortRenderLayerChildren} For manual sorting
     * @see {@link Container#zIndex} For the default sort property
     * @default (a, b) => a.zIndex - b.zIndex
     */
    sortFunction?: (a: Container, b: Container) => number;
}

/*
 * Here we are essentially hiding the Container API even though this class extends a Container.
 * This is just so it fits into the current architecture. When users use a RenderLayer,
 * the Container properties will be hidden from them, as they don't do anything in renderLayers.
 */
type ContainerKeys = keyof Container;
type PartialContainerKeys = Exclude<ContainerKeys,
'parent' | 'didChange' | '_updateFlags' | keyof EventEmitter | 'parentRenderLayer' |
'destroyed' | 'layerParentId' | 'sortableChildren' | 'getFastGlobalBounds'
>;
/** @internal */
export type IRenderLayer = Omit<RenderLayerClass, PartialContainerKeys>;

/** @standard */
class RenderLayerClass extends Container
{
    /**
     * Default options for RenderLayer instances. These options control the sorting behavior
     * of objects within the render layer.
     * @example
     * ```ts
     * // Create a custom render layer with modified default options
     * RenderLayer.defaultOptions = {
     *     sortableChildren: true,
     *     sortFunction: (a, b) => a.y - b.y // Sort by vertical position
     * };
     *
     * // All new render layers will use these defaults
     * const layer1 = new RenderLayer();
     * // layer1 will have sortableChildren = true
     * ```
     * @property {boolean} sortableChildren -
     * @property {Function} sortFunction -
     * @see {@link RenderLayer} For the main render layer class
     * @see {@link Container#zIndex} For the default sort property
     * @see {@link RenderLayer#sortRenderLayerChildren} For manual sorting
     */
    public static defaultOptions: RenderLayerOptions = {
        /** If true, layer children will be automatically sorted each render. Default is false. */
        sortableChildren: false,
        /**
         * Function used to sort layer children.
         * Default sorts by zIndex. Accepts two Container objects and returns
         * a number indicating their relative order.
         * @param a - First container to compare
         * @param b - Second container to compare
         * @returns Negative if a should render before b, positive if b should render before a
         */
        sortFunction: (a, b) => a.zIndex - b.zIndex,
    };

    /** Function used to sort layer children if sortableChildren is true */
    public sortFunction: (a: Container, b: Container) => number;

    /**
     * The list of objects that this layer is responsible for rendering. Objects in this list maintain
     * their original parent in the scene graph but are rendered as part of this layer.
     * @example
     * ```ts
     * const layer = new RenderLayer();
     * const sprite = new Sprite(texture);
     *
     * // Add sprite to scene graph for transforms
     * container.addChild(sprite);
     *
     * // Add to layer for render order control
     * layer.attach(sprite);
     * console.log(layer.renderLayerChildren.length); // 1
     *
     * // Access objects in the layer
     * layer.renderLayerChildren.forEach(child => {
     *     console.log('Layer child:', child);
     * });
     *
     * // Check if object is in layer
     * const isInLayer = layer.renderLayerChildren.includes(sprite);
     *
     * // Clear all objects from layer
     * layer.detachAll();
     * console.log(layer.renderLayerChildren.length); // 0
     * ```
     * @readonly
     * @see {@link RenderLayer#attach} For adding objects to the layer
     * @see {@link RenderLayer#detach} For removing objects from the layer
     * @see {@link RenderLayer#detachAll} For removing all objects from the layer
     */
    public renderLayerChildren: Container[] = [];

    /**
     * Creates a new RenderLayer instance
     * @param options - Configuration options for the RenderLayer
     * @param {boolean} [options.sortableChildren=false] - If true, layer children will be automatically sorted each render
     * @param {Function} [options.sortFunction] - Custom function to sort layer children. Default sorts by zIndex
     */
    constructor(options: RenderLayerOptions = {})
    {
        options = { ...RenderLayerClass.defaultOptions, ...options };

        super();

        this.sortableChildren = options.sortableChildren;
        this.sortFunction = options.sortFunction;
    }

    /**
     * Adds one or more Containers to this render layer. The Containers will be rendered as part of this layer
     * while maintaining their original parent in the scene graph.
     *
     * If the Container already belongs to a layer, it will be removed from the old layer before being added to this one.
     * @example
     * ```ts
     * const layer = new RenderLayer();
     * const container = new Container();
     * const sprite1 = new Sprite(texture1);
     * const sprite2 = new Sprite(texture2);
     *
     * // Add sprites to scene graph for transforms
     * container.addChild(sprite1, sprite2);
     *
     * // Add sprites to layer for render order control
     * layer.attach(sprite1, sprite2);
     *
     * // Add single sprite with type checking
     * const typedSprite = layer.attach<Sprite>(new Sprite(texture3));
     * typedSprite.tint = 'red';
     *
     * // Automatically removes from previous layer if needed
     * const otherLayer = new RenderLayer();
     * otherLayer.attach(sprite1); // Removes from previous layer
     * ```
     * @param children - The Container(s) to add to this layer. Can be any Container or array of Containers.
     * @returns The first child that was added, for method chaining
     * @see {@link RenderLayer#detach} For removing objects from the layer
     * @see {@link RenderLayer#detachAll} For removing all objects from the layer
     * @see {@link Container#addChild} For adding to scene graph hierarchy
     */
    public attach<U extends Container[]>(...children: U): U[0]
    {
        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            if (child.parentRenderLayer)
            {
                if (child.parentRenderLayer === this) continue;

                child.parentRenderLayer.detach(child);
            }

            this.renderLayerChildren.push(child);

            child.parentRenderLayer = this;

            const renderGroup = this.renderGroup || this.parentRenderGroup;

            if (renderGroup)
            {
                renderGroup.structureDidChange = true;
            }
        }

        return children[0];
    }

    /**
     * Removes one or more Containers from this render layer. The Containers will maintain their
     * original parent in the scene graph but will no longer be rendered as part of this layer.
     * @example
     * ```ts
     * const layer = new RenderLayer();
     * const container = new Container();
     * const sprite1 = new Sprite(texture1);
     * const sprite2 = new Sprite(texture2);
     *
     * // Add sprites to scene graph and layer
     * container.addChild(sprite1, sprite2);
     * layer.attach(sprite1, sprite2);
     *
     * // Remove single sprite from layer
     * layer.detach(sprite1);
     * // sprite1 is still child of container but not rendered in layer
     *
     * // Remove multiple sprites at once
     * const otherLayer = new RenderLayer();
     * otherLayer.attach(sprite3, sprite4);
     * otherLayer.detach(sprite3, sprite4);
     *
     * // Type-safe detachment
     * const typedSprite = layer.detach<Sprite>(spriteInLayer);
     * typedSprite.texture = newTexture; // TypeScript knows this is a Sprite
     * ```
     * @param children - The Container(s) to remove from this layer
     * @returns The first child that was removed, for method chaining
     * @see {@link RenderLayer#attach} For adding objects to the layer
     * @see {@link RenderLayer#detachAll} For removing all objects from the layer
     * @see {@link Container#removeChild} For removing from scene graph hierarchy
     */
    public detach<U extends Container[]>(...children: U): U[0]
    {
        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            const index = this.renderLayerChildren.indexOf(child);

            if (index !== -1)
            {
                this.renderLayerChildren.splice(index, 1);
            }

            child.parentRenderLayer = null;

            const renderGroup = this.renderGroup || this.parentRenderGroup;

            if (renderGroup)
            {
                renderGroup.structureDidChange = true;
            }
        }

        return children[0];
    }

    /**
     * Removes all objects from this render layer. Objects will maintain their
     * original parent in the scene graph but will no longer be rendered as part of this layer.
     * @example
     * ```ts
     * const layer = new RenderLayer();
     * const container = new Container();
     *
     * // Add multiple sprites to scene graph and layer
     * const sprites = [
     *     new Sprite(texture1),
     *     new Sprite(texture2),
     *     new Sprite(texture3)
     * ];
     *
     * container.addChild(...sprites);  // Add to scene graph
     * layer.attach(...sprites);       // Add to render layer
     *
     * // Later, remove all sprites from layer at once
     * layer.detachAll();
     * console.log(layer.renderLayerChildren.length); // 0
     * console.log(container.children.length);        // 3 (still in scene graph)
     * ```
     * @returns The RenderLayer instance for method chaining
     * @see {@link RenderLayer#attach} For adding objects to the layer
     * @see {@link RenderLayer#detach} For removing individual objects
     * @see {@link Container#removeChildren} For removing from scene graph
     */
    public detachAll()
    {
        const layerChildren = this.renderLayerChildren;

        for (let i = 0; i < layerChildren.length; i++)
        {
            layerChildren[i].parentRenderLayer = null;
        }

        this.renderLayerChildren.length = 0;
    }

    /**
     * Collects renderables for this layer and its children.
     * This method is called by the renderer to gather all objects that should be rendered in this layer.
     * @param instructionSet - The set of instructions to collect renderables into.
     * @param renderer - The renderer that is collecting renderables.
     * @param _currentLayer - The current render layer being processed.
     * @internal
     */
    public override collectRenderables(instructionSet: InstructionSet, renderer: Renderer, _currentLayer: RenderLayerClass
    ): void
    {
        const layerChildren = this.renderLayerChildren;
        const length = layerChildren.length;

        if (this.sortableChildren)
        {
            this.sortRenderLayerChildren();
        }

        for (let i = 0; i < length; i++)
        {
            if (!layerChildren[i].parent)
            {
                // eslint-disable-next-line max-len
                warn('Container must be added to both layer and scene graph. Layers only handle render order - the scene graph is required for transforms (addChild)',
                    layerChildren[i]);
            }

            layerChildren[i].collectRenderables(instructionSet, renderer, this);
        }
    }

    /**
     * Sort the layer's children using the defined sort function. This method allows manual sorting
     * of layer children and is automatically called during rendering if sortableChildren is true.
     * @example
     * ```ts
     * const layer = new RenderLayer();
     *
     * // Add multiple sprites at different depths
     * const sprite1 = new Sprite(texture);
     * const sprite2 = new Sprite(texture);
     * const sprite3 = new Sprite(texture);
     *
     * sprite1.zIndex = 3;
     * sprite2.zIndex = 1;
     * sprite3.zIndex = 2;
     *
     * layer.attach(sprite1, sprite2, sprite3);
     *
     * // Manual sorting with default zIndex sort
     * layer.sortRenderLayerChildren();
     * // Order is now: sprite2 (1), sprite3 (2), sprite1 (3)
     *
     * // Custom sort by y position
     * layer.sortFunction = (a, b) => a.y - b.y;
     * layer.sortRenderLayerChildren();
     *
     * // Automatic sorting
     * layer.sortableChildren = true; // Will sort each render
     * ```
     * @returns The RenderLayer instance for method chaining
     * @see {@link RenderLayer#sortableChildren} For enabling automatic sorting
     * @see {@link RenderLayer#sortFunction} For customizing the sort logic
     */
    public sortRenderLayerChildren()
    {
        this.renderLayerChildren.sort(this.sortFunction);
    }

    /**
     * Recursively calculates the global bounds of this RenderLayer and its children.
     * @param factorRenderLayers
     * @param bounds
     * @param _currentLayer
     * @internal
     */
    public override _getGlobalBoundsRecursive(
        factorRenderLayers: boolean,
        bounds: Bounds,
        _currentLayer: RenderLayerClass,
    ): void
    {
        if (!factorRenderLayers) return;

        const children = this.renderLayerChildren;

        for (let i = 0; i < children.length; i++)
        {
            children[i]._getGlobalBoundsRecursive(true, bounds, this);
        }
    }
}

/**
 * The RenderLayer API provides a way to control the rendering order of objects independently
 * of their logical parent-child relationships in the scene graph.
 * This allows developers to decouple how objects are transformed
 * (via their logical parent) from how they are rendered on the screen.
 *
 * ### Key Concepts
 *
 * #### RenderLayers Control Rendering Order:
 * - RenderLayers define where in the render stack objects are drawn,
 * but they do not affect an object's transformations (e.g., position, scale, rotation) or logical hierarchy.
 * - RenderLayers can be added anywhere in the scene graph.
 *
 * #### Logical Parenting Remains Unchanged:
 * - Objects still have a logical parent for transformations via addChild.
 * - Assigning an object to a layer does not reparent it.
 *
 * #### Explicit Control:
 * - Developers assign objects to layers using renderLayer.add and remove them using renderLayer.remove.
 * ---
 * ### API Details
 *
 * #### 1. Creating a RenderLayer
 * A RenderLayer is a lightweight object responsible for controlling render order.
 * It has no children or transformations of its own
 * but can be inserted anywhere in the scene graph to define its render position.
 * ```js
 * const layer = new RenderLayer();
 * app.stage.addChild(layer); // Insert the layer into the scene graph
 * ```
 *
 * #### 2. Adding Objects to a Layer
 * Use renderLayer.add to assign an object to a layer.
 * This overrides the object's default render order defined by its logical parent.
 * ```js
 * const rect = new Graphics();
 * container.addChild(rect);    // Add to logical parent
 * layer.attach(rect);      // Control render order via the layer
 * ```
 *
 * #### 3. Removing Objects from a Layer
 * To stop an object from being rendered in the layer, use remove.
 * ```js
 * layer.remove(rect); // Stop rendering rect via the layer
 * ```
 * When an object is removed from its logical parent (removeChild), it is automatically removed from the layer.
 *
 * #### 4. Re-Adding Objects to Layers
 * If an object is re-added to a logical parent, it does not automatically reassign itself to the layer.
 * Developers must explicitly reassign it.
 * ```js
 * container.addChild(rect);    // Logical parent
 * layer.attach(rect);      // Explicitly reassign to the layer
 * ```
 *
 * #### 5. Layer Position in Scene Graph
 * A layer's position in the scene graph determines its render priority relative to other layers and objects.
 * Layers can be inserted anywhere in the scene graph.
 * ```js
 * const backgroundLayer = new RenderLayer();
 * const uiLayer = new RenderLayer();
 *
 * app.stage.addChild(backgroundLayer);
 * app.stage.addChild(world);
 * app.stage.addChild(uiLayer);
 * ```
 * This is a new API and therefore considered experimental at this stage.
 * While the core is pretty robust, there are still a few tricky issues we need to tackle.
 * However, even with the known issues below, we believe this API is incredibly useful!
 *
 * Known issues:
 *  - Interaction may not work as expected since hit testing does not account for the visual render order created by layers.
 *    For example, if an object is visually moved to the front via a layer, hit testing will still use its original position.
 *  - RenderLayers and their children must all belong to the same renderGroup to work correctly
 * @category scene
 * @class
 * @extends null
 * @standard
 */
export const RenderLayer = RenderLayerClass as {
    new (options?: RenderLayerOptions): IRenderLayer;
};
