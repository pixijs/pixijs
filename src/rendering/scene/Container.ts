import EventEmitter from 'eventemitter3';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../maths/const';
import { Matrix } from '../../maths/Matrix';
import { ObservablePoint } from '../../maths/ObservablePoint';
import { childrenHelperMixin } from './container-mixins/childrenHelperMixin';
import { effectsMixin } from './container-mixins/effectsMixin';
import { findMixin } from './container-mixins/getByLabelMixin';
import { measureMixin } from './container-mixins/measureMixin';
import { onRenderMixin } from './container-mixins/onRenderMixin';
import { sortMixin } from './container-mixins/sortMixin';
import { toLocalGlobalMixin } from './container-mixins/toLocalGlobalMixin';
import { LayerGroup } from './LayerGroup';

import type { Dict } from '../../utils/types';
import type { Renderable } from '../renderers/shared/Renderable';
import type { BLEND_MODES } from '../renderers/shared/state/const';
import type { View } from '../renderers/shared/View';
import type { DestroyOptions } from './destroyTypes';
import type { Effect } from './Effect';

let uid = 0;

export function getRenderableUID()
{
    return uid++;
}

// as pivot and skew are the least used properties of a container, we can use this optimisation
// to avoid allocating lots of unnecessary objects for them.
const defaultSkew = new ObservablePoint(null);
const defaultPivot = new ObservablePoint(null);
const defaultScale = new ObservablePoint(null, 1, 1);

export interface ContainerEvents extends PixiMixins.ContainerEvents
{
    added: [container: Container];
    childAdded: [child: Container, container: Container, index: number];
    removed: [container: Container];
    childRemoved: [child: Container, container: Container, index: number];
    destroyed: [];
}

export interface ContainerOptions<T extends View>
{
    label?: string;
    layer?: boolean;
    sortableChildren?: boolean;
    view?: T;
}

export const UPDATE_COLOR = 0b0001;
export const UPDATE_BLEND = 0b0010;
export const UPDATE_VISIBLE = 0b0100;
export const UPDATE_TRANSFORM = 0b1000;

export interface Container
    extends Omit<PixiMixins.Container, keyof EventEmitter<ContainerEvents>>,
    EventEmitter<ContainerEvents> {}

export class Container<T extends View = View> extends EventEmitter<ContainerEvents> implements Renderable
{
    /**
     * Mixes all enumerable properties and methods from a source object to Container.
     * @param source - The source of properties and methods to mix in.
     */
    static mixin(source: Dict<any>): void
    {
        Object.defineProperties(Container.prototype, Object.getOwnPropertyDescriptors(source));
    }

    uid: number = uid++;
    label: string = null;

    updateFlags = 0b1111;

    // is this container the root of a layer?
    // TODO implement this in a few more places
    isLayerRoot = false;
    // the layer group this container belongs to OR owns
    // TODO consider separating that?
    // currently just need to check if its a container is layer root
    // to ascertain if its a layer owner or not..
    layerGroup: LayerGroup = null;

    // set to true if the container has changed. It is reset once the changes have been applied
    // by the transform system
    // its here to stop ensure that when things change, only one update gets registers with the transform system
    didChange = false;
    // same as above, but for the renderable
    didViewUpdate = false;
    // how deep is the container relative to its layer..
    // unless the element is the root layer - it will be relative to its parent
    relativeLayerDepth = 0;

    children: Container[] = [];
    parent: Container = null;

    // used internally for changing up the render order.. mainly for masks and filters
    // TODO setting this should cause a rebuild??
    includeInBuild = true;
    measurable = true;
    isSimple = true;

    /// /////////////Transform related props//////////////

    // used by the transform system to check if a container needs to be updated that frame
    // if the tick matches the current transform system tick, it is not updated again
    updateTick = -1;

    localTransform: Matrix = new Matrix();
    // transform relative to its layer..
    layerTransform: Matrix = new Matrix();
    // the global transform taking into account the layer and all parents
    _worldTransform: Matrix;

    // transform data..
    /** The coordinate of the object relative to the local coordinates of the parent. */
    public position: ObservablePoint = new ObservablePoint(this, 0, 0);

    /** The scale factor of the object. */
    public _scale: ObservablePoint = defaultScale;

    /** The pivot point of the displayObject that it rotates around. */
    public _pivot: ObservablePoint = defaultPivot;

    /** The skew amount, on the x and y axis. */
    public _skew: ObservablePoint = defaultSkew;

    /**
     * The X-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     */
    public _cx = 1;

    /**
     * The Y-coordinate value of the normalized local X axis,
     * the first column of the local transformation matrix without a scale.
     */
    public _sx = 0;

    /**
     * The X-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     */
    public _cy = 0;

    /**
     * The Y-coordinate value of the normalized local Y axis,
     * the second column of the local transformation matrix without a scale.
     */
    public _sy = 1;

    /** The rotation amount. */
    public _rotation = 0;

    /// COLOR related props //////////////

    // color stored as ABGR
    public localColor = 0xFFFFFFFF;
    public layerColor = 0xFFFFFFFF;

    /// BLEND related props //////////////

    public localBlendMode: BLEND_MODES = 'inherit';
    public layerBlendMode: BLEND_MODES = 'normal';

    /// VISIBILITY related props //////////////

    // visibility
    // 0b11
    // first bit is visible, second bit is renderable
    localVisibleRenderable = 0b11; // 0b11 | 0b10 | 0b01 | 0b00
    layerVisibleRenderable = 0b11; // 0b11 | 0b10 | 0b01 | 0b00

    /// /// EFFECTS and masks etc...

    effects: Effect[] = [];

    addEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index !== -1) return; // already exists!

        this.effects.push(effect);

        this.effects.sort((a, b) => a.priority - b.priority);

        if (!this.isLayerRoot && this.layerGroup)
        {
            this.layerGroup.structureDidChange = true;
        }

        this.updateIsSimple();
    }

    removeEffect(effect: Effect)
    {
        const index = this.effects.indexOf(effect);

        if (index === -1) return; // already exists!

        this.effects.splice(index, 1);

        if (!this.isLayerRoot && this.layerGroup)
        {
            this.layerGroup.structureDidChange = true;
        }

        this.updateIsSimple();
    }

    // a renderable object... like a sprite!
    public readonly view: T;

    constructor({ label, layer, view, sortableChildren }: ContainerOptions<T> = {})
    {
        super();

        if (label)
        {
            this.label = label;
        }

        if (layer)
        {
            this.enableLayer();
        }

        if (view)
        {
            this.view = view;

            // in the future we could de-couple container and view..
            // but for now this is just faster!
            this.view.owner = this;
        }

        this.sortChildren = !!sortableChildren;
    }

    /**
     * Adds one or more children to the container.
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     * @param {...PIXI.Container} children - The Container(s) to add to the container
     * @returns {PIXI.Container} - The first child that was added.
     */
    addChild<U extends Container[]>(...children: Container[]): U[0]
    {
        if (children.length > 1)
        {
            // loop through the array and add all children
            for (let i = 0; i < children.length; i++)
            {
                this.addChild(children[i]);
            }

            return children[0];
        }

        const child = children[0];

        if (child.parent === this)
        {
            this.children.splice(this.children.indexOf(child), 1);
            this.children.push(child);

            if (this.layerGroup && !this.isLayerRoot)
            {
                this.layerGroup.structureDidChange = true;
            }

            return child;
        }

        if (child.parent)
        {
            // TODO Optimisation...if the parent has the same layer group, this does not need to change!
            child.parent.removeChild(child);
        }

        this.children.push(child);

        if (this.sortChildren) this.sortDirty = true;

        child.parent = this;

        child.didChange = true;
        child.didViewUpdate = false;

        // TODO - OPtimise this? could check what the parent has set?
        child.updateFlags = 0b1111;

        if (this.layerGroup)
        {
            this.layerGroup.addChild(child);
        }

        // this.emit('childAdded', child, this);
        // child.emit('added', this);

        return child;
    }

    /**
     * Removes one or more children from the container.
     * @param {...PIXI.Container} children - The Container(s) to remove
     * @returns {PIXI.Container} The first child that was removed.
     */
    removeChild<U extends Container[]>(...children: U): U[0]
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

        const child = children[0];

        const index = this.children.indexOf(child);

        if (index > -1)
        {
            this.children.splice(index, 1);

            if (this.layerGroup)
            {
                this.layerGroup.removeChild(child);
            }
        }

        child.parent = null;
        // this.emit('childRemoved', child, this, index);
        // child.emit('removed', this);

        return child;
    }

    onUpdate(point?: ObservablePoint)
    {
        if (point)
        {
            //   this.updateFlags |= UPDATE_TRANSFORM;

            if (point === this._skew)
            {
                this.updateSkew();
            }
        }

        if (this.didChange) return;
        this.didChange = true;

        if (this.isLayerRoot)
        {
            const layerGroupParent = this.layerGroup.layerGroupParent;
            // lets update its parent..

            if (layerGroupParent)
            {
                layerGroupParent.onChildUpdate(this);
            }
        }
        else if (this.layerGroup)
        {
            this.layerGroup.onChildUpdate(this);
        }
    }

    onViewUpdate()
    {
        if (this.didViewUpdate) return;
        this.didViewUpdate = true;

        if (this.layerGroup)
        {
            this.layerGroup.onChildViewUpdate(this);
        }
    }

    set layer(value: boolean)
    {
        if (this.isLayerRoot && value === false)
        {
            throw new Error('[Pixi] cannot undo a layer just yet');
        }

        if (value)
        {
            this.enableLayer();
        }
    }

    get layer(): boolean
    {
        return this.isLayerRoot;
    }

    enableLayer()
    {
        // does it OWN the layer..
        if (this.layerGroup && this.layerGroup.root === this) return;

        this.isLayerRoot = true;

        const parentLayerGroup = this.layerGroup;

        if (parentLayerGroup)
        {
            parentLayerGroup.removeChild(this);
        }

        this.layerGroup = new LayerGroup(this);

        // find children layers and move them out..
        if (parentLayerGroup)
        {
            for (let i = 0; i < parentLayerGroup.layerGroupChildren.length; i++)
            {
                const childLayerGroup = parentLayerGroup.layerGroupChildren[i];
                let parent = childLayerGroup.root;

                while (parent)
                {
                    if (parent === this)
                    {
                        this.layerGroup.addLayerGroupChild(childLayerGroup);

                        break;
                    }
                    parent = parent.parent;
                }
            }

            parentLayerGroup.addLayerGroupChild(this.layerGroup);
        }

        this.updateIsSimple();
    }

    get worldTransform()
    {
        this._worldTransform ||= new Matrix();

        if (this.layerGroup)
        {
            if (this.isLayerRoot)
            {
                this._worldTransform.copyFrom(this.layerGroup.worldTransform);
            }
            else
            {
                this._worldTransform.appendFrom(this.layerTransform, this.layerGroup.worldTransform);
            }
        }

        return this._worldTransform;
    }

    /// ////// transform related stuff

    /**
     * The position of the displayObject on the x axis relative to the local coordinates of the parent.
     * An alias to position.x
     */
    get x(): number
    {
        return this.position.x;
    }

    set x(value: number)
    {
        this.position.x = value;
    }

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     * An alias to position.y
     */
    get y(): number
    {
        return this.position.y;
    }

    set y(value: number)
    {
        this.position.y = value;
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
            this.onUpdate(this._skew);
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

    get pivot(): ObservablePoint
    {
        if (this._pivot === defaultPivot)
        {
            this._pivot = new ObservablePoint(this, 0, 0);
        }

        return this._pivot;
    }

    get skew(): ObservablePoint
    {
        if (this._skew === defaultSkew)
        {
            this._skew = new ObservablePoint(this, 0, 0);
        }

        return this._skew;
    }

    get scale(): ObservablePoint
    {
        if (this._scale === defaultScale)
        {
            this._scale = new ObservablePoint(this, 1, 1);
        }

        return this._scale;
    }

    /** Called when the skew or the rotation changes. */
    updateSkew(): void
    {
        const rotation = this._rotation;
        const skew = this._skew;

        this._cx = Math.cos(rotation + skew._y);
        this._sx = Math.sin(rotation + skew._y);
        this._cy = -Math.sin(rotation - skew._x); // cos, added PI/2
        this._sy = Math.cos(rotation - skew._x); // sin, added PI/2
    }

    /// ///// color related stuff

    set alpha(value: number)
    {
        value = (value * 255) | 0;

        if (value === ((this.localColor >> 24) & 0xFF)) return;

        this.localColor = (this.localColor & 0x00FFFFFF) | (value << 24);

        this.updateFlags |= UPDATE_COLOR;

        this.onUpdate();
    }

    get alpha(): number
    {
        return ((this.localColor >> 24) & 0xFF) / 255;
    }

    set tint(value: number)
    {
        // convert RGB to BGR
        value = ((value & 0xFF) << 16) + (value & 0xFF00) + ((value >> 16) & 0xFF);

        if (value === (this.localColor & 0x00FFFFFF)) return;

        // set the BGR values of the color only

        this.localColor = (this.localColor & 0xFF000000) | (value & 0xFFFFFF);

        this.updateFlags |= UPDATE_COLOR;

        this.onUpdate();
    }

    get tint(): number
    {
        const bgr = this.localColor & 0x00FFFFFF;
        // convert bgr to rgb..

        return ((bgr & 0xFF) << 16) + (bgr & 0xFF00) + ((bgr >> 16) & 0xFF);
    }

    /// //////////////// blend related stuff

    set blendMode(value: BLEND_MODES)
    {
        if (this.localBlendMode === value) return;

        // TODO look at this in the future!!
        // blend mode changes break batches!

        // if (this.layerGroup && !this.isLayerRoot)
        // {
        //     const didChangeToAdvanced = this.localBlendMode < (1 << 4) && value >= (1 << 4);

        //     // if its a single non batched item, we can just update the blend mode
        //     if (didChangeToAdvanced || this.children.length !== 0 || !this.view || !this.view.batched)
        //     {
        //         this.layerGroup.structureDidChange = true;
        //     }
        // }

        if (this.layerGroup && !this.isLayerRoot)
        {
            this.layerGroup.structureDidChange = true;
        }

        this.updateFlags |= UPDATE_BLEND;

        this.localBlendMode = value;

        this.onUpdate();
    }

    get blendMode(): BLEND_MODES
    {
        return this.localBlendMode;
    }

    /// ///////// VISIBILITY / RENDERABLE /////////////////

    get visible()
    {
        return !!(this.localVisibleRenderable & 0b10);
    }

    // visible -  the renderable is not shown, also the transform is not updated
    set visible(value: boolean)
    {
        const valueNumber = value ? 1 : 0;

        if ((this.localVisibleRenderable & 0b10) >> 1 === valueNumber) return;

        if (this.layerGroup && !this.isLayerRoot)
        {
            this.layerGroup.structureDidChange = true;
        }

        this.updateFlags |= UPDATE_VISIBLE;

        this.localVisibleRenderable = (this.localVisibleRenderable & 0b01) | (valueNumber << 1);

        this.onUpdate();
    }

    get renderable()
    {
        return !!(this.localVisibleRenderable & 0b01);
    }

    set renderable(value: boolean)
    {
        const valueNumber = value ? 1 : 0;

        if ((this.localVisibleRenderable & 0b01) === valueNumber) return;

        this.localVisibleRenderable = (this.localVisibleRenderable & 0b10) | valueNumber;

        this.updateFlags |= UPDATE_VISIBLE;

        if (this.layerGroup && !this.isLayerRoot)
        {
            this.layerGroup.structureDidChange = true;
        }

        this.onUpdate();
    }

    get isRenderable(): boolean
    {
        const worldAlpha = ((this.layerColor >> 24) & 0xFF);

        return (this.localVisibleRenderable === 0b11 && worldAlpha > 0);
    }

    updateIsSimple()
    {
        this.isSimple = !(this.isLayerRoot) && (this.effects.length === 0);
    }

    /**
     * Removes all internal references and listeners as well as removes children from the display list.
     * Do not use a Container after calling `destroy`.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.children=false] - if set to true, all the children will have their destroy
     *  method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Only used for children with textures e.g. Sprites. If options.children
     * is set to true it should destroy the texture of the child sprite
     * @param {boolean} [options.textureSource=false] - Only used for children with textures e.g. Sprites.
     * If options.children is set to true it should destroy the texture source of the child sprite
     * @param {boolean} [options.context=false] - Only used for children with graphicsContexts e.g. Graphics.
     * If options.children is set to true it should destroy the context of the child graphics
     */
    public destroy(options: DestroyOptions = false): void
    {
        this.removeFromParent();
        this.parent = null;
        // this._onRender = null;
        this._mask = null;
        this._filters = null;
        // this.renderGroup = null;
        // this.parentRenderGroup = null;
        // this.parentTransform = null;
        this.effects = null;
        this.position = null;
        this._scale = null;
        this._pivot = null;
        this._skew = null;

        this.emit('destroyed');

        this.removeAllListeners();

        const destroyChildren = typeof options === 'boolean' ? options : options?.children;

        const oldChildren = this.removeChildren(0, this.children.length);

        if (destroyChildren)
        {
            for (let i = 0; i < oldChildren.length; ++i)
            {
                oldChildren[i].destroy(options);
            }
        }

        if (this.view)
        {
            this.view.destroy(options);
            this.view.owner = null;
        }
    }
}

Container.mixin(childrenHelperMixin);
Container.mixin(toLocalGlobalMixin);
Container.mixin(onRenderMixin);
Container.mixin(measureMixin);
Container.mixin(effectsMixin);
Container.mixin(findMixin);
Container.mixin(sortMixin);

