import EventEmitter from 'eventemitter3';
import { Color, type ColorSource } from '../../color/Color';
import { Matrix } from '../../maths/matrix/Matrix';
import { DEG_TO_RAD, RAD_TO_DEG } from '../../maths/misc/const';
import { ObservablePoint } from '../../maths/point/ObservablePoint';
import { uid } from '../../utils/data/uid';
import { deprecation, v8_0_0 } from '../../utils/logging/deprecation';
import { childrenHelperMixin } from './container-mixins/childrenHelperMixin';
import { effectsMixin } from './container-mixins/effectsMixin';
import { findMixin } from './container-mixins/findMixin';
import { measureMixin } from './container-mixins/measureMixin';
import { onRenderMixin } from './container-mixins/onRenderMixin';
import { sortMixin } from './container-mixins/sortMixin';
import { toLocalGlobalMixin } from './container-mixins/toLocalGlobalMixin';
import { LayerGroup } from './LayerGroup';
import { definedProps } from './utils/definedProps';

import type { PointData } from '../../maths/point/PointData';
import type { Renderable } from '../../rendering/renderers/shared/Renderable';
import type { BLEND_MODES } from '../../rendering/renderers/shared/state/const';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { Dict } from '../../utils/types';
import type { DestroyOptions } from './destroyTypes';

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K: ({} & string) | ({} & symbol)]: any;
};

export const UPDATE_COLOR = 0b0001;
export const UPDATE_BLEND = 0b0010;
export const UPDATE_VISIBLE = 0b0100;
export const UPDATE_TRANSFORM = 0b1000;

/**
 * Constructor options use for Container instances.
 * @see Container
 */
export interface ContainerOptions<T extends View> extends PixiMixins.ContainerOptions
{
    /** @see Container#layer */
    layer?: boolean;
    /** @see Container#view */
    view?: T;

    /** @see Container#blendMode */
    blendMode?: BLEND_MODES;
    /** @see Container#tint */
    tint?: ColorSource;

    /** @see Container#alpha */
    alpha?: number;
    /** @see Container#angle */
    angle?: number;
    /** @see Container#children */
    children?: Container[];
    /** @see Container#parent */
    parent?: Container;
    /** @see Container#renderable */
    renderable?: boolean;
    /** @see Container#rotation */
    rotation?: number;
    /** @see Container#scale */
    scale?: PointData;
    /** @see Container#pivot */
    pivot?: PointData;
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
}

export interface Container
    extends Omit<PixiMixins.Container, keyof EventEmitter<ContainerEvents & AnyEvent>>,
    EventEmitter<ContainerEvents & AnyEvent> {}

export class Container<T extends View = View> extends EventEmitter<ContainerEvents & AnyEvent> implements Renderable
{
    /**
     * Mixes all enumerable properties and methods from a source object to Container.
     * @param source - The source of properties and methods to mix in.
     */
    public static mixin(source: Dict<any>): void
    {
        Object.defineProperties(Container.prototype, Object.getOwnPropertyDescriptors(source));
    }

    /** @internal */
    public uid: number = uid('renderable');

    /** @internal */
    public _updateFlags = 0b1111;

    // is this container the root of a layer?
    // TODO implement this in a few more places
    /** @internal */
    public isLayerRoot = false;
    // the layer group this container belongs to OR owns
    /** @internal */
    public layerGroup: LayerGroup = null;

    // set to true if the container has changed. It is reset once the changes have been applied
    // by the transform system
    // its here to stop ensure that when things change, only one update gets registers with the transform system
    /** @internal */
    public didChange = false;
    // same as above, but for the renderable
    /** @internal */
    public didViewUpdate = false;
    // how deep is the container relative to its layer..
    // unless the element is the root layer - it will be relative to its parent
    /** @internal */
    public relativeLayerDepth = 0;

    public children: Container[] = [];
    public parent: Container = null;

    // used internally for changing up the render order.. mainly for masks and filters
    // TODO setting this should cause a rebuild??
    /** @internal */
    public includeInBuild = true;
    /** @internal */
    public measurable = true;
    /** @internal */
    public isSimple = true;

    /// /////////////Transform related props//////////////

    // used by the transform system to check if a container needs to be updated that frame
    // if the tick matches the current transform system tick, it is not updated again
    /** @internal */
    public updateTick = -1;

    public localTransform: Matrix = new Matrix();
    // transform relative to its layer..
    public layerTransform: Matrix = new Matrix();
    // the global transform taking into account the layer and all parents
    private _worldTransform: Matrix;

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

    /** The rotation amount. */
    private _rotation = 0;

    /// COLOR related props //////////////

    // color stored as ABGR
    /** @internal */
    public localColor = 0xFFFFFFFF;
    /** @internal */
    public layerColor = 0xFFFFFFFF;

    /// BLEND related props //////////////

    /** @internal */
    public localBlendMode: BLEND_MODES = 'inherit';
    /** @internal */
    public layerBlendMode: BLEND_MODES = 'normal';

    /// VISIBILITY related props //////////////

    // visibility
    // 0b11
    // first bit is visible, second bit is renderable
    /** @internal */
    public localVisibleRenderable = 0b11; // 0b11 | 0b10 | 0b01 | 0b00
    /** @internal */
    public layerVisibleRenderable = 0b11; // 0b11 | 0b10 | 0b01 | 0b00

    // a renderable object... like a sprite!
    public readonly view: T;

    constructor(options: Partial<ContainerOptions<T>> = {})
    {
        super();

        if (options.view)
        {
            this.view = options.view;
            // in the future we could de-couple container and view..
            // but for now this is just faster!
            this.view.owner = this;
            options.view = undefined;
        }

        Object.assign(this, definedProps(options));

        this.children = [];
        options.children?.forEach((child) => this.addChild(child));
        this.effects = [];
        options.effects?.forEach((effect) => this.addEffect(effect));
    }

    /**
     * Adds one or more children to the container.
     *
     * Multiple items can be added like so: `myContainer.addChild(thingOne, thingTwo, thingThree)`
     * @param {...Container} children - The Container(s) to add to the container
     * @returns {Container} - The first child that was added.
     */
    public addChild<U extends Container[]>(...children: U): U[0]
    {
        if (!this.allowChildren)
        {
            deprecation(v8_0_0, 'addChild: Only Containers will be allowed to add children in v8.0.0');
        }

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

        if (this.sortableChildren) this.sortDirty = true;

        child.parent = this;

        child.didChange = true;
        child.didViewUpdate = false;

        // TODO - OPtimise this? could check what the parent has set?
        child._updateFlags = 0b1111;

        if (this.layerGroup)
        {
            this.layerGroup.addChild(child);
        }

        this.emit('childAdded', child, this, this.children.length - 1);
        child.emit('added', this);

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
    public removeChild<U extends Container[]>(...children: U): U[0]
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
        this.emit('childRemoved', child, this, index);
        child.emit('removed', this);

        return child;
    }

    /**
     * @param point
     * @internal
     */
    public onUpdate(point?: ObservablePoint)
    {
        if (point)
        {
            //   this.updateFlags |= UPDATE_TRANSFORM;

            if (point === this._skew)
            {
                this._updateSkew();
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

    /** @internal */
    public onViewUpdate()
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

    public enableLayer()
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

        this._updateIsSimple();
    }

    /**
     * @ignore
     */
    public _updateIsSimple()
    {
        this.isSimple = !(this.isLayerRoot) && (this.effects.length === 0);
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

    set pivot(value: PointData)
    {
        if (this._pivot === defaultPivot)
        {
            this._pivot = new ObservablePoint(this, 0, 0);
        }

        this._pivot.copyFrom(value);
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

    set scale(value: PointData)
    {
        if (this._scale === defaultScale)
        {
            this._scale = new ObservablePoint(this, 0, 0);
        }

        this._scale.copyFrom(value);
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

    /// ///// color related stuff

    set alpha(value: number)
    {
        value = (value * 255) | 0;

        if (value === ((this.localColor >> 24) & 0xFF)) return;

        this.localColor = (this.localColor & 0x00FFFFFF) | (value << 24);

        this._updateFlags |= UPDATE_COLOR;

        this.onUpdate();
    }

    get alpha(): number
    {
        return ((this.localColor >> 24) & 0xFF) / 255;
    }

    set tint(value: ColorSource)
    {
        const tempColor = Color.shared.setValue(value);
        const bgr = tempColor.toBgrNumber();

        if (bgr === (this.localColor & 0x00FFFFFF)) return;

        this.localColor = (this.localColor & 0xFF000000) | (bgr & 0xFFFFFF);

        this._updateFlags |= UPDATE_COLOR;

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
        if (this.layerGroup && !this.isLayerRoot)
        {
            this.layerGroup.structureDidChange = true;
        }

        this._updateFlags |= UPDATE_BLEND;

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

        this._updateFlags |= UPDATE_VISIBLE;

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

        this._updateFlags |= UPDATE_VISIBLE;

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
        if (this.destroyed) return;
        this.destroyed = true;

        this.removeFromParent();
        this.parent = null;
        this._mask = null;
        this._filters = null;
        this.effects = null;
        this._position = null;
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
