import { ObservablePoint } from '../maths/ObservablePoint';
import { Texture } from '../rendering/renderers/shared/texture/Texture';
import { emptyViewObserver } from '../rendering/renderers/shared/View';
import { Transform } from '../utils/Transform';

import type { PointData } from '../maths/PointData';
import type { View } from '../rendering/renderers/shared/View';
import type { Bounds } from '../rendering/scene/bounds/Bounds';
import type { TextureDestroyOptions, TypeOrBool } from '../rendering/scene/destroyTypes';

let uid = 0;

export interface TilingSpriteViewOptions
{
    texture?: Texture
    width?: number
    height?: number
    // TODO needs a better name..
    applyAnchorToTexture?: boolean
}

export class TilingSpriteView implements View
{
    public static defaultOptions: TilingSpriteViewOptions = {
        texture: Texture.WHITE,
        width: 256,
        height: 256,
        applyAnchorToTexture: false,
    };

    public readonly owner = emptyViewObserver;
    public readonly uid = uid++;
    public readonly type = 'tilingSprite';
    public batched = true;
    public anchor: ObservablePoint;

    /** @internal */
    public _tileTransform: Transform;
    /** @internal */
    public _texture: Texture;
    /** @internal */
    public _applyAnchorToTexture: boolean;
    /** @internal */
    public _didUpdate: boolean;

    private _bounds: [number, number, number, number] = [0, 1, 0, 0];
    private _boundsDirty = true;
    private _width: number;
    private _height: number;

    constructor(options: TilingSpriteViewOptions)
    {
        options = { ...TilingSpriteView.defaultOptions, ...options };

        this.anchor = new ObservablePoint(this, 0, 0);

        this._applyAnchorToTexture = options.applyAnchorToTexture;

        this.texture = options.texture;
        this._width = options.width;
        this._height = options.height;
        this._tileTransform = new Transform({ observer: this });
    }

    get bounds()
    {
        if (this._boundsDirty)
        {
            this._updateBounds();
            this._boundsDirty = false;
        }

        return this._bounds;
    }

    set texture(value: Texture)
    {
        if (this._texture === value) return;

        this._texture = value;

        this.onUpdate();
    }

    get texture()
    {
        return this._texture;
    }

    set width(value: number)
    {
        this._width = value;
        this.onUpdate();
    }

    get width()
    {
        return this._width;
    }

    set height(value: number)
    {
        this._height = value;
        this.onUpdate();
    }

    get height()
    {
        return this._height;
    }

    private _updateBounds()
    {
        const bounds = this._bounds;

        const anchor = this.anchor;

        const width = this._width;
        const height = this._height;

        bounds[1] = -anchor._x * width;
        bounds[0] = bounds[1] + width;

        bounds[3] = -anchor._y * height;
        bounds[2] = bounds[3] + height;
    }

    public addBounds(bounds: Bounds)
    {
        const _bounds = this.bounds;

        bounds.addFrame(
            _bounds[0],
            _bounds[2],
            _bounds[1],
            _bounds[3],
        );
    }

    public containsPoint(point: PointData)
    {
        const width = this.bounds[2];
        const height = this.bounds[3];
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        if (point.x >= x1 && point.x < x1 + width)
        {
            y1 = -height * this.anchor.y;

            if (point.y >= y1 && point.y < y1 + height) return true;
        }

        return false;
    }

    /**
     * @internal
     */
    public onUpdate()
    {
        this._boundsDirty = true;
        this._didUpdate = true;
        this.owner.onViewUpdate();
    }

    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    public destroy(options: TypeOrBool<TextureDestroyOptions> = false)
    {
        this.anchor = null;
        this._tileTransform = null;
        this._bounds = null;

        const destroyTexture = typeof options === 'boolean' ? options : options?.texture;

        if (destroyTexture)
        {
            const destroyTextureSource = typeof options === 'boolean' ? options : options?.textureSource;

            this._texture.destroy(destroyTextureSource);
        }

        this._texture = null;
    }
}
